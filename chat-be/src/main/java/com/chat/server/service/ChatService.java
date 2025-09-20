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

/**
 * 채팅방과 채팅 메시지 관리를 위한 비즈니스 로직을 처리하는 서비스다.
 * 채팅방 생성, 참여자 관리, 메시지 저장 및 조회, WebSocket을 통한 실시간 알림 등의 기능을 제공한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserBaseRepository userBaseRepository;
    private final RoomParticipantsHistoryRepository participantsRepository;
    private final SimpMessageSendingOperations messagingTemplate; // WebSocket 메시지 전송용

    /**
     * 새로운 채팅방을 생성한다.
     * 참여자 목록을 받아서 채팅방을 생성하고, 모든 참여자에게 JOIN 알림을 전송한다.
     * @param request 채팅방 생성 요청 정보
     * @return 생성된 채팅방 정보
     * @throws EntityNotFoundException 참여자 닉네임에 해당하는 사용자를 찾을 수 없는 경우
     */
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

    /**
     * 특정 사용자가 참여 중인 채팅방 목록을 조회한다.
     * 사용자가 나가지 않은 활성 상태인 채팅방만 반환한다.
     * @param userId 조회할 사용자 ID
     * @return 사용자가 참여 중인 채팅방 목록
     */
    public List<ChatRoomDto> findRoomsByUserId(Long userId) {
        // 사용자가 나가지 않은(quitAt is NULL) 채팅방만 조회
        List<ChatRoom> chatRooms = participantsRepository.findByUserBase_UserIdAndQuitAtIsNull(userId)
                .stream()
                .map(RoomParticipantsHistory::getChatRoom)
                .distinct()
                .collect(Collectors.toList());

        return chatRooms.stream()
                .map(ChatRoomDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 특정 채팅방의 모든 메시지를 조회한다.
     * 생성 시간 순으로 정렬하여 반환한다.
     * @param roomId 메시지를 조회할 채팅방 ID
     * @return 채팅방의 메시지 목록
     */
    public List<ChatMessageDto> findMessagesByRoomId(Long roomId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatRoom_RoomIdOrderByCreatedAtAsc(roomId);
        return messages.stream()
                .map(ChatMessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 새로운 채팅 메시지를 저장한다.
     * @param messageDto 저장할 메시지 정보
     * @return 저장된 메시지 엔티티
     * @throws EntityNotFoundException 채팅방이나 발신자를 찾을 수 없는 경우
     */
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

    /**
     * 특정 채팅방의 상세 정보를 조회한다.
     * @param roomId 조회할 채팅방 ID
     * @return 채팅방 상세 정보
     * @throws EntityNotFoundException 채팅방을 찾을 수 없는 경우
     */
    public ChatRoomDto findRoomById(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다. ID: " + roomId));
        return ChatRoomDto.fromEntity(chatRoom);
    }

    /**
     * 채팅방에서 참여자를 제거한다.
     * 참여자의 퇴장 시간을 기록하고 다른 참여자들에게 퇴장 알림을 전송한다.
     * @param roomId 채팅방 ID
     * @param userId 나갈 사용자 ID
     * @throws EntityNotFoundException 사용자를 찾을 수 없는 경우
     */
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

    /**
     * 특정 채팅방의 현재 참여자 목록을 조회한다.
     * 퇴장하지 않은 활성 참여자만 반환한다.
     * @param roomId 조회할 채팅방 ID
     * @return 현재 참여자 목록
     */
    public List<UserDto> getRoomParticipants(Long roomId) {
        return participantsRepository.findByChatRoom_RoomIdAndQuitAtIsNull(roomId).stream()
                .map(participant -> UserDto.fromEntity(participant.getUserBase()))
                .collect(Collectors.toList());
    }

    /**
     * 채팅방에 새로운 사용자들을 초대한다.
     * 이미 참여 중인 사용자는 제외하고, 새로 초대된 사용자들에게 JOIN 알림을 전송한다.
     * @param roomId 초대할 채팅방 ID
     * @param userNicknames 초대할 사용자들의 닉네임 목록
     * @throws EntityNotFoundException 채팅방이나 초대할 사용자를 찾을 수 없는 경우
     */
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

    /**
     * 사용자가 채팅방에 참여했을 때 WebSocket을 통해 JOIN 알림 메시지를 전송한다.
     * @param roomId 채팅방 ID
     * @param user 참여한 사용자
     */
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

    /**
     * 사용자가 채팅방에서 나갔을 때 WebSocket을 통해 LEAVE 알림 메시지를 전송한다.
     * @param roomId 채팅방 ID
     * @param user 나간 사용자
     */
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

    /**
     * 특정 채팅방의 참여자 기록을 조회한다.
     * 참여 시간 역순으로 정렬하여 반환한다.
     * @param roomId 조회할 채팅방 ID
     * @return 참여자 기록 목록
     */
    public List<ChatRoomDto.ParticipantHistory> getParticipantsHistory(Long roomId) {
        List<RoomParticipantsHistory> histories = participantsRepository.findByChatRoom_RoomIdOrderByJoinedAtDesc(roomId);
        return histories.stream()
                .map(ChatRoomDto.ParticipantHistory::fromEntity)
                .collect(Collectors.toList());
    }
}