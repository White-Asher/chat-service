package com.chat.server.dto;

import com.chat.server.domain.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    public enum MessageType {
        JOIN, LEAVE, TALK
    }

    private MessageType type;
    private Long roomId;
    private Long senderId;
    private String senderNickname;
    private String message;
    private LocalDateTime createdAt;
    private List<UserDto> participants;

    // 엔티티를 DTO로 변환하는 정적 팩토리 메소드
    public static ChatMessageDto fromEntity(ChatMessage chatMessage) {
        return ChatMessageDto.builder()
                .type(MessageType.TALK) // DB에서 조회한 메시지는 TALK 타입
                .roomId(chatMessage.getChatRoom().getRoomId())
                .senderId(chatMessage.getSender().getUserId())
                .senderNickname(chatMessage.getSender().getUserNickname())
                .message(chatMessage.getMessageContent())
                .createdAt(chatMessage.getCreatedAt())
                .build();
    }
}
