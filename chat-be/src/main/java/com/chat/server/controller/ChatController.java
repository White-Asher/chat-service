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

/**
 * 채팅방과 채팅 메시지 관리를 위한 REST API 컨트롤러다.
 * 채팅방 생성, 조회, 참여자 관리, 메시지 조회, 초대 등의 기능을 제공한다.
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * 특정 사용자가 참여한 채팅방 목록을 조회한다.
     * @param userId 사용자 ID
     * @return 사용자가 참여한 채팅방 목록
     */
    @GetMapping("/rooms/user/{userId}")
    public ResponseEntity<List<ChatRoomDto>> getChatRoomsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.findRoomsByUserId(userId));
    }

    /**
     * 새로운 채팅방을 생성한다.
     * @param request 채팅방 생성 요청 정보
     * @return 생성된 채팅방 정보
     */
    @PostMapping("/room")
    public ResponseEntity<ChatRoomDto> createChatRoom(@RequestBody ChatRoomDto.CreateRequest request) {
        return ResponseEntity.ok(chatService.createChatRoom(request));
    }

    /**
     * 특정 채팅방의 상세 정보를 조회한다.
     * @param roomId 조회할 채팅방 ID
     * @return 채팅방 상세 정보
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ChatRoomDto> getRoomInfo(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatService.findRoomById(roomId));
    }

    /**
     * 특정 채팅방의 모든 메시지를 조회한다.
     * @param roomId 메시지를 조회할 채팅방 ID
     * @return 채팅방의 메시지 목록
     */
    @GetMapping("/room/{roomId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessagesByRoomId(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatService.findMessagesByRoomId(roomId));
    }

    /**
     * 현재 사용자가 채팅방에서 나간다.
     * @param roomId 나갈 채팅방 ID
     * @param principal 현재 인증된 사용자 정보
     * @return 빈 응답
     */
    @PostMapping("/room/{roomId}/leave")
    public ResponseEntity<Void> leaveChatRoom(@PathVariable Long roomId, Principal principal) {
        // Principal에서 사용자 ID를 가져온다
        UserDto user = (UserDto) ((Authentication) principal).getPrincipal();
        chatService.removeParticipant(roomId, user.getUserId());
        return ResponseEntity.ok().build();
    }

    /**
     * 채팅방에 사용자들을 초대한다.
     * @param roomId 초대할 채팅방 ID
     * @param userNicknames 초대할 사용자들의 닉네임 목록
     * @return 빈 응답
     */
    @PostMapping("/room/{roomId}/invite")
    public ResponseEntity<Void> inviteUsersToRoom(@PathVariable Long roomId, @RequestBody List<String> userNicknames, Authentication authentication) {
        UserDto inviter = (UserDto) authentication.getPrincipal();
        chatService.inviteUsersToRoom(roomId, inviter.getUserId(), userNicknames);
        return ResponseEntity.ok().build();
    }

    /**
     * 채팅방의 참여자 기록을 조회한다.
     * @param roomId 조회할 채팅방 ID
     * @return 참여자 기록 목록
     */
    @GetMapping("/room/{roomId}/participants/history")
    public ResponseEntity<List<ChatRoomDto.ParticipantHistory>> getParticipantsHistory(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatService.getParticipantsHistory(roomId));
    }
}
