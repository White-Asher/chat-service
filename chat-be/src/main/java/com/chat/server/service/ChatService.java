package com.chat.server.service;

import com.chat.server.domain.*;
import com.chat.server.dto.ChatMessageDto;
import com.chat.server.dto.ChatRoomDto;
import com.chat.server.dto.UserDto;
import com.chat.server.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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

    @Transactional
    public ChatRoomDto createChatRoom(ChatRoomDto.CreateRequest request) {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setRoomName(request.getRoomName());
        chatRoom.setRoomType(request.getRoomType());
        chatRoom.setIsActive("Y");

        List<RoomParticipantsHistory> participants = request.getUserNicknames().stream()
                .map(nickname -> {
                    UserBase user = userBaseRepository.findByUserNickname(nickname)
                            .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. 닉네임: " + nickname));

                    RoomParticipantsHistory participant = new RoomParticipantsHistory();
                    participant.setChatRoom(chatRoom);
                    participant.setUserBase(user);
                    participant.setJoinedAt(LocalDateTime.now());
                    return participant;
                }).collect(Collectors.toList());

        chatRoom.getParticipants().addAll(participants);
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        // 저장된 엔티티를 DTO로 변환하여 반환
        return ChatRoomDto.fromEntity(savedChatRoom);
    }

    public List<ChatRoomDto> findRoomsByUserId(Long userId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findChatRoomsByUserId(userId);
        // 조회된 엔티티 리스트를 DTO 리스트로 변환
        return chatRooms.stream()
                .map(ChatRoomDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDto> findMessagesByRoomId(Long roomId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatRoom_RoomIdOrderByCreatedAtAsc(roomId);
        // 조회된 엔티티 리스트를 DTO 리스트로 변환
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
    public void addParticipant(Long roomId, Long userId) {
        RoomParticipantsHistory participant = participantsRepository.findByChatRoom_RoomIdAndUserBase_UserId(roomId, userId)
                .orElseGet(() -> {
                    ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                            .orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다. ID: " + roomId));
                    UserBase user = userBaseRepository.findById(userId)
                            .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + userId));
                    RoomParticipantsHistory newParticipant = new RoomParticipantsHistory();
                    newParticipant.setChatRoom(chatRoom);
                    newParticipant.setUserBase(user);
                    return newParticipant;
                });

        participant.setJoinedAt(LocalDateTime.now());
        participant.setQuitAt(null); // 재입장 시 퇴장 시간 초기화
        participantsRepository.save(participant);
    }

    @Transactional
    public void removeParticipant(Long roomId, Long userId) {
        participantsRepository.findByChatRoom_RoomIdAndUserBase_UserId(roomId, userId)
                .ifPresent(participant -> {
                    if (participant.getQuitAt() == null) {
                        participant.setQuitAt(LocalDateTime.now());
                        participantsRepository.save(participant);
                    }
                });
    }

    public List<UserDto> getRoomParticipants(Long roomId) {
        return participantsRepository.findByChatRoom_RoomIdAndQuitAtIsNull(roomId).stream()
                .map(participant -> UserDto.fromEntity(participant.getUserBase()))
                .collect(Collectors.toList());
    }
}
