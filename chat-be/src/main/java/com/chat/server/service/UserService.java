package com.chat.server.service;

import com.chat.server.domain.UserAuthBase;
import com.chat.server.exception.CustomException;
import com.chat.server.exception.ErrorCode;
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

/**
 * 사용자 관리를 위한 비즈니스 로직을 처리하는 서비스다.
 * 사용자 CRUD, 회원가입, 로그인, 닉네임 변경 등의 기능을 제공한다.
 */
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

    /**
     * 세션 타임아웃 값을 분 단위로 변환한다.
     * @return 세션 타임아웃 시간 (분)
     */
    private long getSessionTimeoutInMinutes() {
        String timeoutValue = sessionTimeout.toLowerCase().replace("m", "");
        return Long.parseLong(timeoutValue);
    }

    /**
     * 새로운 사용자를 생성한다.
     * 닉네임 중복 검사를 수행한 후 사용자 정보를 저장한다.
     * @param request 사용자 생성 요청 정보
     * @return 생성된 사용자 정보
     * @throws CustomException 닉네임이 이미 존재하는 경우
     */
    @Transactional
    public UserDto createUser(UserDto.CreateRequest request) {
        if (userBaseRepository.findByUserNickname(request.getUserNickname()).isPresent()) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }
        UserBase user = new UserBase();
        user.setUserNickname(request.getUserNickname());
        user.setProfileImgUrl(request.getProfileImgUrl());
        UserBase savedUser = userBaseRepository.save(user);
        return UserDto.fromEntity(savedUser);
    }

    /**
     * 특정 사용자의 정보를 조회한다.
     * @param userId 조회할 사용자 ID
     * @return 조회된 사용자 정보
     * @throws CustomException 사용자를 찾을 수 없는 경우
     */
    public UserDto findUserById(Long userId) {
        UserBase user = userBaseRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return UserDto.fromEntity(user);
    }

    /**
     * 특정 사용자의 정보를 수정한다.
     * @param userId 수정할 사용자 ID
     * @param request 수정할 사용자 정보
     * @return 수정된 사용자 정보
     * @throws CustomException 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public UserDto updateUser(Long userId, UserDto.UpdateRequest request) {
        // 사용자 ID로 조회
        UserBase user = userBaseRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.setUserNickname(request.getUserNickname());
        user.setProfileImgUrl(request.getProfileImgUrl());
        UserBase updatedUser = userBaseRepository.save(user);
        return UserDto.fromEntity(updatedUser);
    }

    /**
     * 특정 사용자를 삭제한다.
     * @param userId 삭제할 사용자 ID
     */
    @Transactional
    public void deleteUser(Long userId) {
        userBaseRepository.deleteById(userId);
    }

    /**
     * 새로운 사용자 계정을 생성한다.
     * 아이디와 닉네임의 중복 검사를 수행하고, 사용자 프로필과 인증 정보를 각각 저장한다.
     * @param request 회원가입 요청 정보 (로그인 ID, 비밀번호, 닉네임)
     * @return 생성된 사용자 정보
     * @throws CustomException 아이디나 닉네임이 이미 사용중인 경우
     */
    @Transactional
    public UserDto signUp(AuthRequest.SignUp request) {
        log.info("Request: {}", request);
        // 1. 아이디 중복 체크
        if (userAuthBaseRepository.existsByLoginId(request.getLoginId())) {
            throw new CustomException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        // 2. 닉네임 중복 체크
        if (userBaseRepository.existsByUserNickname(request.getNickname())) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
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

        // 5. 생성된 사용자 정보를 DTO로 변환하여 반환
        return UserDto.fromEntity(savedUserBase);
    }

    /**
     * 사용자 로그인 처리를 수행한다.
     * 로그인 ID와 비밀번호를 검증하여 인증에 성공하면 사용자 정보를 반환한다.
     * @param request 로그인 요청 정보 (로그인 ID, 비밀번호)
     * @return 로그인한 사용자 정보 (세션 타임아웃 정보 포함)
     * @throws CustomException 아이디 또는 비밀번호가 일치하지 않는 경우
     */
    @Transactional(readOnly = true)
    public UserDto login(AuthRequest.Login request) {
        // 1. 로그인 아이디로 사용자 인증 정보 조회
        UserAuthBase userAuth = userAuthBaseRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new CustomException(ErrorCode.LOGIN_INPUT_INVALID));

        // 2. 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(request.getPassword(), userAuth.getPassword())) {
            throw new CustomException(ErrorCode.LOGIN_INPUT_INVALID);
        }

        // 3. 인증 성공 시, 연결된 프로필 정보를 DTO로 변환하여 반환
        UserDto userDto = UserDto.fromEntity(userAuth.getUserBase());
        userDto.setSessionTimeoutInMinutes(getSessionTimeoutInMinutes());
        return userDto;
    }

    /**
     * 사용자의 닉네임을 변경한다.
     * 새로운 닉네임의 유효성과 중복 여부를 검사한 후 변경을 수행한다.
     * @param userId 닉네임을 변경할 사용자 ID
     * @param newNickname 새로운 닉네임
     * @return 업데이트된 사용자 정보
     * @throws CustomException 사용자를 찾을 수 없거나, 새 닉네임이 현재 닉네임과 동일하거나, 이미 사용중인 닉네임인 경우
     */
    @Transactional
    public UserDto updateNickname(Long userId, String newNickname) {
        UserBase user = userBaseRepository.findById(userId)
            .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 현재 닉네임과 동일한지 확인
        if (user.getUserNickname().equals(newNickname)) {
            throw new CustomException(ErrorCode.NICKNAME_UPDATE_FAILED);
        }

        // 다른 사용자가 이미 사용 중인 닉네임인지 확인
        if (userBaseRepository.existsByUserNickname(newNickname)) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }

        user.setUserNickname(newNickname);
        UserBase updatedUser = userBaseRepository.save(user);
        return UserDto.fromEntity(updatedUser);
    }
}