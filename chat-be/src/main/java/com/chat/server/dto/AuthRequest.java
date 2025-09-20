package com.chat.server.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 사용자 인증과 관련된 요청 데이터를 담는 DTO 클래스다.
 * 회원가입과 로그인 요청에 사용되는 내부 클래스들을 포함한다.
 */
public class AuthRequest {

    /**
     * 회원가입 요청 데이터를 담는 DTO 클래스다.
     * 사용자의 닉네임, 로그인 ID, 비밀번호 정보를 포함한다.
     */
    @Getter
    @Setter
    public static class SignUp {
        /**
         * 사용자 닉네임
         */
        private String nickname;
        
        /**
         * 로그인에 사용할 ID
         */
        private String loginId;
        
        /**
         * 로그인 비밀번호
         */
        private String password;
    }

    /**
     * 로그인 요청 데이터를 담는 DTO 클래스다.
     * 로그인 ID와 비밀번호 정보를 포함한다.
     */
    @Getter
    @Setter
    public static class Login {
        /**
         * 로그인에 사용할 ID
         */
        private String loginId;
        
        /**
         * 로그인 비밀번호
         */
        private String password;
    }
}
