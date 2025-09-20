package com.chat.server.controller;

import com.chat.server.dto.FriendDto;
import com.chat.server.dto.FriendRequestDto;
import com.chat.server.dto.UserDto;
import com.chat.server.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 친구 관리를 위한 REST API 컨트롤러다.
 * 친구 검색, 친구 요청 송수신, 수락/거절, 친구 삭제, 친구 목록 조회 등의 기능을 제공한다.
 */
@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    /**
     * 닉네임으로 사용자를 검색한다.
     * @param nickname 검색할 닉네임
     * @param principal 현재 인증된 사용자 정보
     * @return 검색된 사용자 목록
     */
    @GetMapping("/search")
    public ResponseEntity<List<FriendDto>> searchUsers(@RequestParam String nickname, Principal principal) {
        UserDto currentUser = (UserDto) ((Authentication) principal).getPrincipal();
        return ResponseEntity.ok(friendService.searchUsers(nickname, currentUser.getUserId()));
    }

    /**
     * 다른 사용자에게 친구 요청을 보낸다.
     * @param request 친구 요청 정보 (수신자 ID)
     * @param principal 현재 인증된 사용자 정보
     * @return 빈 응답
     */
    @PostMapping("/requests")
    public ResponseEntity<Void> sendFriendRequest(@RequestBody FriendRequestDto.SendRequest request, Principal principal) {
        UserDto currentUser = (UserDto) ((Authentication) principal).getPrincipal();
        friendService.sendFriendRequest(currentUser.getUserId(), request.getRecipientId());
        return ResponseEntity.ok().build();
    }

    /**
     * 받은 친구 요청을 수락한다.
     * @param friendId 친구 관계 ID
     * @return 빈 응답
     */
    @PostMapping("/requests/{friendId}/accept")
    public ResponseEntity<Void> acceptFriendRequest(@PathVariable Long friendId) {
        friendService.acceptFriendRequest(friendId);
        return ResponseEntity.ok().build();
    }

    /**
     * 받은 친구 요청을 거절한다.
     * @param friendId 친구 관계 ID
     * @return 빈 응답
     */
    @DeleteMapping("/requests/{friendId}")
    public ResponseEntity<Void> rejectFriendRequest(@PathVariable Long friendId) {
        friendService.rejectFriendRequest(friendId);
        return ResponseEntity.ok().build();
    }

    /**
     * 기존 친구를 삭제한다.
     * @param friendId 삭제할 친구의 ID
     * @param principal 현재 인증된 사용자 정보
     * @return 빈 응답
     */
    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable Long friendId, Principal principal) {
        UserDto currentUser = (UserDto) ((Authentication) principal).getPrincipal();
        friendService.removeFriend(currentUser.getUserId(), friendId);
        return ResponseEntity.ok().build();
    }

    /**
     * 현재 사용자의 친구 목록을 조회한다.
     * @param principal 현재 인증된 사용자 정보
     * @return 친구 목록
     */
    @GetMapping
    public ResponseEntity<List<FriendDto>> getFriendList(Principal principal) {
        UserDto currentUser = (UserDto) ((Authentication) principal).getPrincipal();
        return ResponseEntity.ok(friendService.getFriendList(currentUser.getUserId()));
    }

    /**
     * 현재 사용자가 받은 대기 중인 친구 요청 목록을 조회한다.
     * @param principal 현재 인증된 사용자 정보
     * @return 대기 중인 친구 요청 목록
     */
    @GetMapping("/requests/pending")
    public ResponseEntity<List<FriendRequestDto>> getPendingFriendRequests(Principal principal) {
        UserDto currentUser = (UserDto) ((Authentication) principal).getPrincipal();
        return ResponseEntity.ok(friendService.getPendingFriendRequests(currentUser.getUserId()));
    }
}
