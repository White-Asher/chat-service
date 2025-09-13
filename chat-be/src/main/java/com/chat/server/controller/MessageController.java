package com.chat.server.controller;

import com.chat.server.dto.ChatMessageDto;
import com.chat.server.dto.UserDto;
import com.chat.server.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

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
                chatService.addParticipant(message.getRoomId(), message.getSenderId());
                participants = chatService.getRoomParticipants(message.getRoomId());
                message.setParticipants(participants);
                message.setMessage(message.getSenderNickname() + "님이 입장하셨습니다.");
                break;
            case LEAVE:
                chatService.removeParticipant(message.getRoomId(), message.getSenderId());
                participants = chatService.getRoomParticipants(message.getRoomId());
                message.setParticipants(participants);
                message.setMessage(message.getSenderNickname() + "님이 퇴장하셨습니다.");
                break;
            case TALK:
                chatService.saveMessage(message);
                break;
        }

        // /topic/chat/room/{roomId}를 구독하고 있는 클라이언트에게 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat/room/" + message.getRoomId(), message);
    }
}

