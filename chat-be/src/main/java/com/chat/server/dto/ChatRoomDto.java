package com.chat.server.dto;

import com.chat.server.domain.ChatRoom;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class ChatRoomDto {
    private Long roomId;
    private String roomName;
    private String roomType;
    private List<UserDto> participants; // 참여자 정보를 UserDto로 변환하여 포함

    // 엔티티를 DTO로 변환하는 정적 팩토리 메소드
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

    @Data
    public static class CreateRequest {
        private String roomName;
        private String roomType;
        private List<String> userNicknames;
    }
}
