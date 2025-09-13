package com.chat.server.controller;

import com.chat.server.dto.AuthRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.chat.server.domain.UserBase;
import com.chat.server.dto.UserDto;
import com.chat.server.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserBase> createUser(@RequestBody UserDto.CreateRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserBase> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.findUserById(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserBase> updateUser(@PathVariable Long userId, @RequestBody UserDto.UpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    // 회원가입 API
    @PostMapping("/signup")
    public ResponseEntity<UserDto> signUp(@RequestBody AuthRequest.SignUp request) {
        UserDto userDto = userService.signUp(request);
        return ResponseEntity.ok(userDto);
    }

    // 로그인 API
    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody AuthRequest.Login request) {
        UserDto userDto = userService.login(request);
        return ResponseEntity.ok(userDto);
    }

}