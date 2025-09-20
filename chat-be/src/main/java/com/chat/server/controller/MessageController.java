package com.chat.server.controller;

import com.chat.server.domain.ChatMessage;
import com.chat.server.dto.ChatMessageDto;
import com.chat.server.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

/**
 * WebSocket을 통한 실시간 메시지 전송을 처리하는 컨트롤러다.
 * 클라이언트로부터 메시지를 받아서 저장하고 해당 채팅방을 구독한 모든 클라이언트에게 브로드캐스트한다.
 */
@Controller
@RequiredArgsConstructor
public class MessageController {

    private final ChatService chatService;
    private final SimpMessageSendingOperations messagingTemplate;

    /**
     * WebSocket을 통해 받은 메시지를 처리한다.
     * TALK 타입 메시지는 데이터베이스에 저장하고, 모든 메시지를 해당 채팅방 구독자들에게 브로드캐스트한다.
     * @param message 클라이언트로부터 받은 채팅 메시지
     */
    @MessageMapping("/chat/message")
    public void message(ChatMessageDto message) {
        // TALK 타입 메시지만 처리
        if (message.getType() == ChatMessageDto.MessageType.TALK) {
            ChatMessage saved = chatService.saveMessage(message);
            // 저장된 메시지의 생성 시간으로 채워서 프론트가 즉시 시간 표시 가능
            if (saved != null) {
                message.setCreatedAt(saved.getCreatedAt());
            } else {
                message.setCreatedAt(LocalDateTime.now());
            }
        }

        // /topic/chat/room/{roomId}를 구독하고 있는 클라이언트에게 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat/room/" + message.getRoomId(), message);
    }
}