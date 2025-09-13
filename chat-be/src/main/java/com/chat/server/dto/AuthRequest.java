package com.chat.server.dto;

import lombok.Getter;
import lombok.Setter;

// 여러 인증 요청에 사용할 DTO 클래스들을 하나의 파일에 정의
public class AuthRequest {

    @Getter
    @Setter
    public static class SignUp {
        private String nickname;
        private String loginId;
        private String password;
    }

    @Getter
    @Setter
    public static class Login {
        private String loginId;
        private String password;
    }
}
