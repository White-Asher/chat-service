package com.chat.server.controller;

import com.chat.server.dto.AuthRequest;
import com.chat.server.dto.UserDto;
import com.chat.server.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
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
import java.util.Map;

/**
 * 사용자 관리를 위한 REST API 컨트롤러다.
 * 회원가입, 로그인, 로그아웃, 사용자 정보 CRUD 등의 기능을 제공한다.
 * Spring Security와 세션을 통한 인증/인가를 처리한다.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 새로운 사용자를 생성한다.
     * @param request 사용자 생성 요청 데이터
     * @return 생성된 사용자 정보
     */
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto.CreateRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    /**
     * 특정 사용자의 정보를 조회한다.
     * @param userId 조회할 사용자 ID
     * @return 사용자 정보
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.findUserById(userId));
    }

    /**
     * 특정 사용자의 정보를 수정한다.
     * @param userId 수정할 사용자 ID
     * @param request 수정할 사용자 데이터
     * @return 수정된 사용자 정보
     */
    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long userId, @RequestBody UserDto.UpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    /**
     * 특정 사용자를 삭제한다.
     * @param userId 삭제할 사용자 ID
     * @return 빈 응답
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 현재 로그인한 사용자의 닉네임을 변경한다.
     * 변경 후 SecurityContext와 세션의 인증 정보도 함께 업데이트한다.
     * @param requestBody 새로운 닉네임이 담긴 요청 본문
     * @param authentication 현재 인증 정보
     * @param httpServletRequest HTTP 요청 객체 (세션 접근용)
     * @return 업데이트된 사용자 정보
     */
    @PutMapping("/me/nickname")
    public ResponseEntity<UserDto> updateMyNickname(@RequestBody Map<String, String> requestBody, Authentication authentication, HttpServletRequest httpServletRequest) {
        UserDto currentUser = (UserDto) authentication.getPrincipal();
        String newNickname = requestBody.get("nickname");

        UserDto updatedUserDto = userService.updateNickname(currentUser.getUserId(), newNickname);

        // 세션에 저장된 Authentication 정보 업데이트
        Authentication newAuthentication = new UsernamePasswordAuthenticationToken(
            updatedUserDto,
            null,
            authentication.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(newAuthentication);

        // 세션을 가져와 SecurityContext를 명시적으로 저장
        HttpSession session = httpServletRequest.getSession(false); // 이미 세션이 존재해야 함
        if (session != null) {
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
        }

        return ResponseEntity.ok(updatedUserDto);
    }

    /**
     * 새로운 사용자 계정을 생성한다.
     * @param request 회원가입 요청 정보 (아이디, 비밀번호, 닉네임 등)
     * @return 생성된 사용자 정보
     */
    @PostMapping("/signup")
    public ResponseEntity<UserDto> signUp(@Valid @RequestBody AuthRequest.SignUp request) {
        UserDto userDto = userService.signUp(request);
        return ResponseEntity.ok(userDto);
    }

    /**
     * 사용자 로그인을 처리하고 세션을 생성한다.
     * Spring Security의 SecurityContext를 설정하여 인증 상태를 유지한다.
     * @param request 로그인 요청 정보 (아이디, 비밀번호)
     * @param httpServletRequest HTTP 요청 객체 (세션 생성용)
     * @return 로그인한 사용자 정보
     */
    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody AuthRequest.Login request,
            HttpServletRequest httpServletRequest) {
        // 1. 사용자 서비스 통해 인증
        UserDto userDto = userService.login(request);

        // 2. Spring Security용 인증 토큰 생성
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDto,
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

        // 3. 새로운 SecurityContext를 생성하고 인증 정보 설정
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // 4. 세션을 가져와 SecurityContext를 명시적으로 저장
        HttpSession session = httpServletRequest.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", context);

        return ResponseEntity.ok(userDto);
    }

    /**
     * 사용자 로그아웃을 처리한다.
     * 세션을 무효화하고 SecurityContext를 초기화한다.
     * @param request HTTP 요청 객체 (세션 접근용)
     * @return 빈 응답
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext(); // SecurityContext 초기화
        return ResponseEntity.ok().build();
    }

    /**
     * 현재 로그인한 사용자의 정보를 조회한다.
     * 세션 기반으로 인증 상태를 확인하고 사용자 정보를 반환한다.
     * @param principal 현재 인증된 사용자 정보
     * @return 현재 사용자 정보 또는 401 Unauthorized
     */
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
