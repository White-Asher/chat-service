package com.chat.server.dto;

import com.chat.server.domain.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 채팅 메시지 전송 및 수신을 위한 DTO 클래스다.
 * WebSocket을 통한 실시간 메시지 전송과 REST API 응답에 사용된다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    
    /**
     * 메시지 타입을 나타내는 열거형이다.
     * 채팅방 참여/퇴장 알림과 일반 대화 메시지를 구분한다.
     */
    public enum MessageType {
        /**
         * 채팅방 입장 알림 메시지
         */
        JOIN, 
        
        /**
         * 채팅방 퇴장 알림 메시지
         */
        LEAVE, 
        
        /**
         * 일반 대화 메시지
         */
        TALK
    }

    /**
     * 메시지 타입 (JOIN, LEAVE, TALK)
     */
    private MessageType type;
    
    /**
     * 메시지가 전송된 채팅방 ID
     */
    private Long roomId;
    
    /**
     * 메시지 발신자 ID
     */
    private Long senderId;
    
    /**
     * 메시지 발신자 닉네임
     */
    private String senderNickname;
    
    /**
     * 메시지 내용
     */
    private String message;
    
    /**
     * 메시지 생성 시간
     */
    private LocalDateTime createdAt;
    
    /**
     * 현재 채팅방 참여자 목록 (JOIN/LEAVE 메시지에 포함)
     */
    private List<UserDto> participants;

    /**
     * ChatMessage 엔티티를 ChatMessageDto로 변환한다.
     * 데이터베이스에서 조회한 메시지는 항상 TALK 타입으로 설정한다.
     * @param chatMessage 변환할 ChatMessage 엔티티
     * @return 변환된 ChatMessageDto
     */
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
