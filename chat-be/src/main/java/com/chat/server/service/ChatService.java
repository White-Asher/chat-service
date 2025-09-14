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
        // 가장 최근 참여 기록을 조회하여 재사용하거나, 없으면 새로 생성합니다.
        RoomParticipantsHistory participant = participantsRepository.findFirstByChatRoom_RoomIdAndUserBase_UserIdOrderByJoinedAtDesc(roomId, userId)
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

        // 이미 활성 상태(퇴장 기록 없음)이면 아무것도 하지 않습니다.
        if (participant.getQuitAt() == null) {
            return;
        }

        // 비활성 상태이면 재입장 처리
        participant.setJoinedAt(LocalDateTime.now());
        participant.setQuitAt(null); // 재입장 시 퇴장 시간 초기화
        participantsRepository.save(participant);
    }

    @Transactional
    public void removeParticipant(Long roomId, Long userId) {
        // 활성 상태('quitAt'이 null)인 참여 기록을 찾아 퇴장 시간을 기록합니다.
        participantsRepository.findByChatRoom_RoomIdAndUserBase_UserIdAndQuitAtIsNull(roomId, userId)
                .ifPresent(participant -> {
                    participant.setQuitAt(LocalDateTime.now());
                    participantsRepository.save(participant);
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

            // 이미 참여 중인 사용자인지 확인
            boolean isAlreadyParticipant = participantsRepository.findByChatRoom_RoomIdAndUserBase_UserIdAndQuitAtIsNull(roomId, user.getUserId()).isPresent();
            
            if (!isAlreadyParticipant) {
                // 새로운 참여자 기록 생성 또는 기존 기록 재활성화
                RoomParticipantsHistory participant = participantsRepository.findFirstByChatRoom_RoomIdAndUserBase_UserIdOrderByJoinedAtDesc(roomId, user.getUserId())
                        .orElseGet(() -> {
                            RoomParticipantsHistory newParticipant = new RoomParticipantsHistory();
                            newParticipant.setChatRoom(chatRoom);
                            newParticipant.setUserBase(user);
                            return newParticipant;
                        });

                // 입장 시간 설정 및 퇴장 시간 초기화
                participant.setJoinedAt(LocalDateTime.now());
                participant.setQuitAt(null);
                participantsRepository.save(participant);
            }
        }
    }

    public List<ChatRoomDto.ParticipantHistory> getParticipantsHistory(Long roomId) {
        List<RoomParticipantsHistory> histories = participantsRepository.findByChatRoom_RoomIdOrderByJoinedAtDesc(roomId);
        return histories.stream()
                .map(ChatRoomDto.ParticipantHistory::fromEntity)
                .collect(Collectors.toList());
    }
}