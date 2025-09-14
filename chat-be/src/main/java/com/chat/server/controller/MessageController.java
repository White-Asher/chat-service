package com.chat.server.controller;

import com.chat.server.domain.ChatMessage;
import com.chat.server.dto.ChatMessageDto;
import com.chat.server.dto.UserDto;
import com.chat.server.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class MessageController {

    private final ChatService chatService;
    private final SimpMessageSendingOperations messagingTemplate;

    @MessageMapping("/chat/message")
    public void message(ChatMessageDto message) {
        List<UserDto> participants;
        switch (message.getType()) {
            case JOIN:
                // 실제 입장 처리는 하지 않고 알림용으로만 사용
                // 참여자 목록은 현재 활성 참여자들로 설정
                participants = chatService.getRoomParticipants(message.getRoomId());
                message.setParticipants(participants);
                message.setMessage(message.getSenderNickname() + "님이 채팅방에 접속했습니다.");
                message.setCreatedAt(LocalDateTime.now());
                break;
            case LEAVE:
                // 실제 퇴장 처리는 하지 않고 알림용으로만 사용
                // 참여자 목록은 현재 활성 참여자들로 설정
                participants = chatService.getRoomParticipants(message.getRoomId());
                message.setParticipants(participants);
                message.setMessage(message.getSenderNickname() + "님이 채팅방에서 나갔습니다.");
                message.setCreatedAt(LocalDateTime.now());
                break;
            case TALK:
                ChatMessage saved = chatService.saveMessage(message);
                // 저장된 메시지의 생성 시간으로 채워서 프론트가 즉시 시간 표시 가능
                if (saved != null) {
                    message.setCreatedAt(saved.getCreatedAt());
                } else {
                    message.setCreatedAt(LocalDateTime.now());
                }
                break;
        }

        // /topic/chat/room/{roomId}를 구독하고 있는 클라이언트에게 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat/room/" + message.getRoomId(), message);
    }
}

