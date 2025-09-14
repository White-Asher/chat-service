package com.chat.server.controller;

import com.chat.server.dto.ChatMessageDto;
import com.chat.server.dto.ChatRoomDto;
import com.chat.server.dto.UserDto;
import com.chat.server.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
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

    @PostMapping("/room/{roomId}/leave")
    public ResponseEntity<Void> leaveChatRoom(@PathVariable Long roomId, Principal principal) {
        // Principal에서 사용자 ID를 가져옵니다.
        // UserDto는 Serializable이므로 Principal에서 직접 캐스팅 가능
        UserDto user = (UserDto) ((Authentication) principal).getPrincipal();
        chatService.removeParticipant(roomId, user.getUserId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/room/{roomId}/invite")
    public ResponseEntity<Void> inviteUsersToRoom(@PathVariable Long roomId, @RequestBody List<String> userNicknames) {
        chatService.inviteUsersToRoom(roomId, userNicknames);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/room/{roomId}/participants/history")
    public ResponseEntity<List<ChatRoomDto.ParticipantHistory>> getParticipantsHistory(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatService.getParticipantsHistory(roomId));
    }
}
