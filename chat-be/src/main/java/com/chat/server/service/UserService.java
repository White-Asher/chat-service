package com.chat.server.service;

import com.chat.server.domain.UserAuthBase;
import com.chat.server.dto.AuthRequest;
import com.chat.server.repository.UserAuthBaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chat.server.domain.UserBase;
import com.chat.server.dto.UserDto;
import com.chat.server.repository.UserBaseRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UserService {

    private final UserBaseRepository userBaseRepository;
    private final UserAuthBaseRepository userAuthBaseRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${server.servlet.session.timeout}")
    private String sessionTimeout;

    private long getSessionTimeoutInMinutes() {
        String timeoutValue = sessionTimeout.toLowerCase().replace("m", "");
        return Long.parseLong(timeoutValue);
    }

    @Transactional
    public UserDto createUser(UserDto.CreateRequest request) {
        if (userBaseRepository.findByUserNickname(request.getUserNickname()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
        }
        UserBase user = new UserBase();
        user.setUserNickname(request.getUserNickname());
        user.setProfileImgUrl(request.getProfileImgUrl());
        UserBase savedUser = userBaseRepository.save(user);
        return UserDto.fromEntity(savedUser);
    }

    public UserDto findUserById(Long userId) {
        UserBase user = userBaseRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateUser(Long userId, UserDto.UpdateRequest request) {
        // findUserById는 이제 UserBase를 반환하므로, 내부적으로 UserBase를 찾는 별도 메소드를 사용하거나, findUserById를 그대로 사용하고 싶다면 UserBase를 반환하도록 유지해야 합니다.
        // 여기서는 findUserById가 UserBase를 반환한다고 가정하고 내부 로직을 수정합니다.
        UserBase user = userBaseRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));
        user.setUserNickname(request.getUserNickname());
        user.setProfileImgUrl(request.getProfileImgUrl());
        UserBase updatedUser = userBaseRepository.save(user);
        return UserDto.fromEntity(updatedUser);
    }

    @Transactional
    public void deleteUser(Long userId) {
        userBaseRepository.deleteById(userId);
    }

    /**
     * 회원가입 비즈니스 로직
     */
    @Transactional
    public UserDto signUp(AuthRequest.SignUp request) {
        log.info("Request: {}", request);
        // 1. 아이디 중복 체크
        if (userAuthBaseRepository.existsByLoginId(request.getLoginId())) {
            throw new IllegalArgumentException("이미 사용중인 아이디입니다.");
        }

        // 2. 닉네임 중복 체크 (이전에 누락되었던 부분)
        if (userBaseRepository.existsByUserNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용중인 닉네임입니다.");
        }

        // 3. 사용자 프로필 정보(user_base) 저장
        UserBase newUserBase = new UserBase();
        newUserBase.setUserNickname(request.getNickname());
        UserBase savedUserBase = userBaseRepository.save(newUserBase);

        log.info("Created UserBase: {}", savedUserBase);


        // 4. 사용자 인증 정보(user_auth_base) 저장
        UserAuthBase newUserAuth = new UserAuthBase();
        newUserAuth.setLoginId(request.getLoginId());
        newUserAuth.setPassword(passwordEncoder.encode(request.getPassword())); // 비밀번호 암호화
        newUserAuth.setUserBase(savedUserBase); // 생성된 프로필과 연결
        userAuthBaseRepository.save(newUserAuth);

        // 5. 생성된 사용자 정보를 DTO로 변환하여 반환 (이전에 누락되었던 부분)
        return UserDto.fromEntity(savedUserBase);
    }

    /**
     * 로그인 비즈니스 로직
     */
    @Transactional(readOnly = true)
    public UserDto login(AuthRequest.Login request) {
        // 1. 로그인 아이디로 사용자 인증 정보 조회
        UserAuthBase userAuth = userAuthBaseRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다."));

        // 2. 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(request.getPassword(), userAuth.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // 3. 인증 성공 시, 연결된 프로필 정보를 DTO로 변환하여 반환
        UserDto userDto = UserDto.fromEntity(userAuth.getUserBase());
        userDto.setSessionTimeoutInMinutes(getSessionTimeoutInMinutes());
        return userDto;
    }

    @Transactional
    public UserDto updateNickname(Long userId, String newNickname) {
        UserBase user = userBaseRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));

        // 현재 닉네임과 동일한지 확인
        if (user.getUserNickname().equals(newNickname)) {
            throw new IllegalArgumentException("새 닉네임이 현재 닉네임과 동일합니다.");
        }

        // 다른 사용자가 이미 사용 중인 닉네임인지 확인
        if (userBaseRepository.existsByUserNickname(newNickname)) {
            throw new IllegalArgumentException("이미 사용중인 닉네임입니다.");
        }

        user.setUserNickname(newNickname);
        UserBase updatedUser = userBaseRepository.save(user);
        return UserDto.fromEntity(updatedUser);
    }
}