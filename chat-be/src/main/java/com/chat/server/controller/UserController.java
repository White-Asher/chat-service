package com.chat.server.controller;

import com.chat.server.domain.UserBase;
import com.chat.server.dto.AuthRequest;
import com.chat.server.dto.UserDto;
import com.chat.server.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto.CreateRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.findUserById(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long userId, @RequestBody UserDto.UpdateRequest request) {
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
    public ResponseEntity<UserDto> login(@RequestBody AuthRequest.Login request, HttpServletRequest httpServletRequest) {
        // 1. 사용자 서비스 통해 인증
        UserDto userDto = userService.login(request);

        // 2. Spring Security용 인증 토큰 생성
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDto,
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );

        // 3. 새로운 SecurityContext를 생성하고 인증 정보 설정
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // 4. 세션을 가져와 SecurityContext를 명시적으로 저장
        HttpSession session = httpServletRequest.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", context);

        return ResponseEntity.ok(userDto);
    }

    // 로그아웃 API
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext(); // SecurityContext 초기화
        return ResponseEntity.ok().build();
    }

    // 세션 확인 및 내 정보 조회 API
    @GetMapping("/me")
    public ResponseEntity<UserDto> getMyInfo(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // SecurityContext에서 직접 Authentication 객체를 가져와 UserDto를 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDto user = (UserDto) authentication.getPrincipal();
        return ResponseEntity.ok(user);
    }
}
