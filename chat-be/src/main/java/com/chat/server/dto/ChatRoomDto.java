package com.chat.server.dto;

import com.chat.server.domain.ChatRoom;
import com.chat.server.domain.RoomParticipantsHistory;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 채팅방 정보를 담는 DTO 클래스다.
 * 채팅방 기본 정보와 현재 참여자 목록을 포함한다.
 */
@Data
@Builder
public class ChatRoomDto {
    /**
     * 채팅방 고유 식별자
     */
    private Long roomId;
    
    /**
     * 채팅방 이름
     */
    private String roomName;
    
    /**
     * 채팅방 타입 ("ONE": 1대1 채팅, "GROUP": 그룹 채팅)
     */
    private String roomType;
    
    /**
     * 현재 채팅방 참여자 목록
     */
    private List<UserDto> participants;

    /**
     * ChatRoom 엔티티를 ChatRoomDto로 변환한다.
     * 현재 참여 중인 사용자만 참여자 목록에 포함한다.
     * @param chatRoom 변환할 ChatRoom 엔티티
     * @return 변환된 ChatRoomDto
     */
    public static ChatRoomDto fromEntity(ChatRoom chatRoom) {
        List<UserDto> participantDtos = chatRoom.getParticipants().stream()
                .filter(p -> p.getQuitAt() == null) // 활성 참여자만 필터링
                .map(p -> UserDto.fromEntity(p.getUserBase()))
                .collect(Collectors.toList());

        return ChatRoomDto.builder()
                .roomId(chatRoom.getRoomId())
                .roomName(chatRoom.getRoomName())
                .roomType(chatRoom.getRoomType())
                .participants(participantDtos)
                .build();
    }

    /**
     * 채팅방 생성 요청 데이터를 담는 DTO 클래스다.
     * 채팅방 이름, 타입, 초기 참여자 닉네임 목록을 포함한다.
     */
    @Data
    public static class CreateRequest {
        /**
         * 생성할 채팅방 이름
         */
        private String roomName;
        
        /**
         * 채팅방 타입 ("ONE" 또는 "GROUP")
         */
        private String roomType;
        
        /**
         * 초기 참여자들의 닉네임 목록
         */
        private List<String> userNicknames;
    }

    /**
     * 채팅방 참여자 기록 정보를 담는 DTO 클래스다.
     * 사용자의 입장 및 퇴장 시간을 포함한다.
     */
    @Data
    @Builder
    public static class ParticipantHistory {
        /**
         * 참여자 닉네임
         */
        private String userNickname;
        
        /**
         * 채팅방 입장 시간
         */
        private LocalDateTime joinedAt;
        
        /**
         * 채팅방 퇴장 시간 (null이면 현재 참여 중)
         */
        private LocalDateTime quitAt;

        /**
         * RoomParticipantsHistory 엔티티를 ParticipantHistory DTO로 변환한다.
         * @param history 변환할 RoomParticipantsHistory 엔티티
         * @return 변환된 ParticipantHistory DTO
         */
        public static ParticipantHistory fromEntity(RoomParticipantsHistory history) {
            return ParticipantHistory.builder()
                    .userNickname(history.getUserBase().getUserNickname())
                    .joinedAt(history.getJoinedAt())
                    .quitAt(history.getQuitAt())
                    .build();
        }
    }
}
