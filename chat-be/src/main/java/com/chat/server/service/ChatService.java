package com.chat.server.service;

import com.chat.server.domain.*;
import com.chat.server.dto.ChatMessageDto;
import com.chat.server.dto.ChatRoomDto;
import com.chat.server.dto.UserDto;
import com.chat.server.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserBaseRepository userBaseRepository;
    private final RoomParticipantsHistoryRepository participantsRepository;
    private final SimpMessageSendingOperations messagingTemplate; // WebSocket 메시지 전송용

    @Transactional
    public ChatRoomDto createChatRoom(ChatRoomDto.CreateRequest request) {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setRoomName(request.getRoomName());
        chatRoom.setRoomType(request.getRoomType());
        chatRoom.setIsActive("Y");

        List<UserBase> users = request.getUserNicknames().stream()
            .map(nickname -> userBaseRepository.findByUserNickname(nickname)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. 닉네임: " + nickname)))
            .collect(Collectors.toList());

        List<RoomParticipantsHistory> participants = users.stream()
                .map(user -> {
                    RoomParticipantsHistory participant = new RoomParticipantsHistory();
                    participant.setChatRoom(chatRoom);
                    participant.setUserBase(user);
                    participant.setJoinedAt(LocalDateTime.now());
                    return participant;
                }).collect(Collectors.toList());

        chatRoom.getParticipants().addAll(participants);
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);

        // 생성 후 참여자들에게 JOIN 메시지 전송
        users.forEach(user -> {
            sendJoinNotification(savedChatRoom.getRoomId(), user);
        });

        return ChatRoomDto.fromEntity(savedChatRoom);
    }

    public List<ChatRoomDto> findRoomsByUserId(Long userId) {
        // 사용자가 나가지 않은(quitAt is NULL) 채팅방만 조회하도록 수정
        List<ChatRoom> chatRooms = participantsRepository.findByUserBase_UserIdAndQuitAtIsNull(userId)
                .stream()
                .map(RoomParticipantsHistory::getChatRoom)
                .distinct()
                .collect(Collectors.toList());

        return chatRooms.stream()
                .map(ChatRoomDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDto> findMessagesByRoomId(Long roomId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatRoom_RoomIdOrderByCreatedAtAsc(roomId);
        return messages.stream()
                .map(ChatMessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessage saveMessage(ChatMessageDto messageDto) {
        ChatRoom chatRoom = chatRoomRepository.findById(messageDto.getRoomId())
                .orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다. ID: " + messageDto.getRoomId()));
        UserBase sender = userBaseRepository.findById(messageDto.getSenderId())
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + messageDto.getSenderId()));

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setChatRoom(chatRoom);
        chatMessage.setSender(sender);
        chatMessage.setMessageContent(messageDto.getMessage());

        return chatMessageRepository.save(chatMessage);
    }

    public ChatRoomDto findRoomById(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다. ID: " + roomId));
        return ChatRoomDto.fromEntity(chatRoom);
    }

    @Transactional
    public void removeParticipant(Long roomId, Long userId) {
        UserBase user = userBaseRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + userId));

        participantsRepository.findByChatRoom_RoomIdAndUserBase_UserIdAndQuitAtIsNull(roomId, userId)
                .ifPresent(participant -> {
                    participant.setQuitAt(LocalDateTime.now());
                    participantsRepository.save(participant);

                    // 퇴장 알림 메시지 전송
                    sendLeaveNotification(roomId, user);
                });
    }

    public List<UserDto> getRoomParticipants(Long roomId) {
        return participantsRepository.findByChatRoom_RoomIdAndQuitAtIsNull(roomId).stream()
                .map(participant -> UserDto.fromEntity(participant.getUserBase()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void inviteUsersToRoom(Long roomId, List<String> userNicknames) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다. ID: " + roomId));

        for (String nickname : userNicknames) {
            UserBase user = userBaseRepository.findByUserNickname(nickname)
                    .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. 닉네임: " + nickname));

            boolean isAlreadyParticipant = participantsRepository.findByChatRoom_RoomIdAndUserBase_UserIdAndQuitAtIsNull(roomId, user.getUserId()).isPresent();

            if (!isAlreadyParticipant) {
                RoomParticipantsHistory participant = participantsRepository.findFirstByChatRoom_RoomIdAndUserBase_UserIdOrderByJoinedAtDesc(roomId, user.getUserId())
                        .orElseGet(() -> {
                            RoomParticipantsHistory newParticipant = new RoomParticipantsHistory();
                            newParticipant.setChatRoom(chatRoom);
                            newParticipant.setUserBase(user);
                            return newParticipant;
                        });

                participant.setJoinedAt(LocalDateTime.now());
                participant.setQuitAt(null);
                participantsRepository.save(participant);

                // 초대된 사용자에게 JOIN 메시지 전송
                sendJoinNotification(roomId, user);
            }
        }
    }

    private void sendJoinNotification(Long roomId, UserBase user) {
        ChatMessageDto joinMessage = ChatMessageDto.builder()
            .type(ChatMessageDto.MessageType.JOIN)
            .roomId(roomId)
            .senderId(user.getUserId())
            .senderNickname(user.getUserNickname())
            .message(user.getUserNickname() + "님이 채팅방에 참여했습니다.")
            .createdAt(LocalDateTime.now())
            .participants(getRoomParticipants(roomId)) // 최신 참여자 목록
            .build();
        messagingTemplate.convertAndSend("/topic/chat/room/" + roomId, joinMessage);
    }

    private void sendLeaveNotification(Long roomId, UserBase user) {
        ChatMessageDto leaveMessage = ChatMessageDto.builder()
            .type(ChatMessageDto.MessageType.LEAVE)
            .roomId(roomId)
            .senderId(user.getUserId())
            .senderNickname(user.getUserNickname())
            .message(user.getUserNickname() + "님이 채팅방에서 나갔습니다.")
            .createdAt(LocalDateTime.now())
            .participants(getRoomParticipants(roomId)) // 최신 참여자 목록
            .build();
        messagingTemplate.convertAndSend("/topic/chat/room/" + roomId, leaveMessage);
    }


    public List<ChatRoomDto.ParticipantHistory> getParticipantsHistory(Long roomId) {
        List<RoomParticipantsHistory> histories = participantsRepository.findByChatRoom_RoomIdOrderByJoinedAtDesc(roomId);
        return histories.stream()
                .map(ChatRoomDto.ParticipantHistory::fromEntity)
                .collect(Collectors.toList());
    }
}