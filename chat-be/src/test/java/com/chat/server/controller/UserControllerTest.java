package com.chat.server.controller;

import com.chat.server.domain.UserAuthBase;
import com.chat.server.domain.UserBase;
import com.chat.server.dto.AuthRequest;
import com.chat.server.dto.UserDto;
import com.chat.server.exception.CustomException;
import com.chat.server.exception.ErrorCode;
import com.chat.server.repository.UserAuthBaseRepository;
import com.chat.server.repository.UserBaseRepository;
import com.chat.server.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.lenient;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @Autowired
    private UserBaseRepository userBaseRepository;

    @Autowired
    private UserAuthBaseRepository userAuthBaseRepository;

    private AuthRequest.SignUp createSignUpRequest() {
        AuthRequest.SignUp request = new AuthRequest.SignUp();
        request.setLoginId("testuser");
        request.setPassword("password123");
        request.setNickname("testnick");
        return request;
    }

    private AuthRequest.Login createLoginRequest() {
        AuthRequest.Login request = new AuthRequest.Login();
        request.setLoginId("testuser");
        request.setPassword("password");
        return request;
    }

    @BeforeEach
    void setUpTestUser() {
        // 테스트용 유저 생성 및 저장
        UserBase user = new UserBase();
        user.setUserNickname("testnick");
        userBaseRepository.save(user);

        UserAuthBase auth = new UserAuthBase();
        auth.setLoginId("testuser");
        auth.setPassword("password123");
        auth.setUserBase(user);
        userAuthBaseRepository.save(auth);
    }

    @Test
    @DisplayName("회원가입 API 성공")
    void signUp_success() throws Exception {
        // given
        AuthRequest.SignUp request = createSignUpRequest();
        UserDto responseDto = UserDto.builder().userId(3L).userNickname("testnick").build();

        given(userService.signUp(any(AuthRequest.SignUp.class))).willReturn(responseDto);

        // when & then
        mockMvc.perform(post("/api/users/signup").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(3L))
                .andExpect(jsonPath("$.userNickname").value("testnick"))
                .andDo(print());
    }

    @Test
    @DisplayName("회원가입 API 실패 - 아이디 중복")
    void signUp_fail_duplicateLoginId() throws Exception {
        // given
        AuthRequest.SignUp request = createSignUpRequest();

        given(userService.signUp(any(AuthRequest.SignUp.class)))
                .willThrow(new CustomException(ErrorCode.DUPLICATE_LOGIN_ID));

        // when & then
        mockMvc.perform(post("/api/users/signup").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errCd").value(ErrorCode.DUPLICATE_LOGIN_ID.getCode()))
                .andExpect(jsonPath("$.errMsg").value(ErrorCode.DUPLICATE_LOGIN_ID.getMessage()))
                .andDo(print());
    }

    @Test
    @DisplayName("로그인 API 성공")
    void login_success() throws Exception {
        // given
        AuthRequest.Login request = createLoginRequest();
        UserDto responseDto = UserDto.builder().userId(3L).userNickname("testnick").build();

        given(userService.login(any(AuthRequest.Login.class))).willReturn(responseDto);

        // when & then
        mockMvc.perform(post("/api/users/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(3L))
                .andExpect(jsonPath("$.userNickname").value("testnick"))
                .andDo(print());
    }

    @Test
    @DisplayName("로그인 API 실패 - 로그인 정보 불일치")
    void login_fail_invalidInput() throws Exception {
        // given
        AuthRequest.Login request = new AuthRequest.Login();
        request.setLoginId("testuser");
        request.setPassword("wrongpassword");

        lenient().when(userService.login(any(AuthRequest.Login.class)))
                .thenThrow(new CustomException(ErrorCode.LOGIN_INPUT_INVALID));

        // when & then
        mockMvc.perform(post("/api/users/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errCd").value(ErrorCode.LOGIN_INPUT_INVALID.getCode()))
                .andExpect(jsonPath("$.errMsg").value(ErrorCode.LOGIN_INPUT_INVALID.getMessage()))
                .andDo(print());
    }

    @Test
    @DisplayName("회원가입 요청 테스트")
    void signUpRequestTest() throws Exception {
        AuthRequest.SignUp request = createSignUpRequest();

        mockMvc.perform(post("/api/users/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk());
    }
}