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

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping("/search")
    public ResponseEntity<List<FriendDto>> searchUsers(@RequestParam String nickname, Principal principal) {
        UserDto currentUser = (UserDto) ((Authentication) principal).getPrincipal();
        return ResponseEntity.ok(friendService.searchUsers(nickname, currentUser.getUserId()));
    }

    @PostMapping("/requests")
    public ResponseEntity<Void> sendFriendRequest(@RequestBody FriendRequestDto.SendRequest request, Principal principal) {
        UserDto currentUser = (UserDto) ((Authentication) principal).getPrincipal();
        friendService.sendFriendRequest(currentUser.getUserId(), request.getRecipientId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/requests/{friendId}/accept")
    public ResponseEntity<Void> acceptFriendRequest(@PathVariable Long friendId) {
        friendService.acceptFriendRequest(friendId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/requests/{friendId}")
    public ResponseEntity<Void> rejectFriendRequest(@PathVariable Long friendId) {
        friendService.rejectFriendRequest(friendId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable Long friendId, Principal principal) {
        UserDto currentUser = (UserDto) ((Authentication) principal).getPrincipal();
        friendService.removeFriend(currentUser.getUserId(), friendId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<FriendDto>> getFriendList(Principal principal) {
        UserDto currentUser = (UserDto) ((Authentication) principal).getPrincipal();
        return ResponseEntity.ok(friendService.getFriendList(currentUser.getUserId()));
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<List<FriendRequestDto>> getPendingFriendRequests(Principal principal) {
        UserDto currentUser = (UserDto) ((Authentication) principal).getPrincipal();
        return ResponseEntity.ok(friendService.getPendingFriendRequests(currentUser.getUserId()));
    }
}
