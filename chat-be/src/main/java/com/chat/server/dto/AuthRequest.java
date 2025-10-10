package com.chat.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
        @NotBlank(message = "닉네임은 필수 입력 값입니다.")
        @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하로 입력해주세요.")
        private String nickname;
        
        /**
         * 로그인에 사용할 ID
         */
        @NotBlank(message = "아이디는 필수 입력 값입니다.")
        @Size(min = 4, max = 12, message = "아이디는 4자 이상 12자 이하로 입력해주세요.")
        private String loginId;
        
        /**
         * 로그인 비밀번호
         */
        @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
        @Size(min = 6, max = 15, message = "비밀번호는 6자 이상 15자 이하로 입력해주세요.")
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
