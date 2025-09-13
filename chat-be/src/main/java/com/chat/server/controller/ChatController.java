package com.chat.server.controller;

import com.chat.server.dto.ChatMessageDto;
import com.chat.server.dto.ChatRoomDto;
import com.chat.server.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // API 경로를 프론트엔드 호출과 일치하도록 수정
    @GetMapping("/rooms/user/{userId}")
    public ResponseEntity<List<ChatRoomDto>> getChatRoomsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.findRoomsByUserId(userId));
    }

    @PostMapping("/room")
    public ResponseEntity<ChatRoomDto> createChatRoom(@RequestBody ChatRoomDto.CreateRequest request) {
        return ResponseEntity.ok(chatService.createChatRoom(request));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<ChatRoomDto> getRoomInfo(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatService.findRoomById(roomId));
    }

    @GetMapping("/room/{roomId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessagesByRoomId(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatService.findMessagesByRoomId(roomId));
    }
}
