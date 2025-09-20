package com.chat.server.dto;

import com.chat.server.domain.UserBase;
import lombok.*;

import java.io.Serializable;

/**
 * 사용자 정보를 담는 DTO 클래스다.
 * Spring Security 인증 객체로 사용되며, 세션에 저장되므로 Serializable을 구현한다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 사용자 고유 식별자
     */
    private Long userId;
    
    /**
     * 사용자 닉네임
     */
    private String userNickname;
    
    /**
     * 프로필 이미지 URL
     */
    private String profileImgUrl;
    
    /**
     * 세션 타임아웃 시간 (분 단위)
     */
    private Long sessionTimeoutInMinutes;

    /**
     * 사용자 생성 요청 데이터를 담는 DTO 클래스다.
     * 새로운 사용자 프로필 생성에 사용된다.
     */
    @Getter
    @Setter
    public static class CreateRequest {
        /**
         * 생성할 사용자의 닉네임
         */
        private String userNickname;
        
        /**
         * 생성할 사용자의 프로필 이미지 URL
         */
        private String profileImgUrl;
    }

    /**
     * 사용자 수정 요청 데이터를 담는 DTO 클래스다.
     * 기존 사용자 프로필 정보 수정에 사용된다.
     */
    @Getter
    @Setter
    public static class UpdateRequest {
        /**
         * 수정할 사용자의 닉네임
         */
        private String userNickname;
        
        /**
         * 수정할 사용자의 프로필 이미지 URL
         */
        private String profileImgUrl;
    }

    /**
     * UserBase 엔티티를 UserDto로 변환한다.
     * 엔티티의 기본 정보를 DTO로 매핑한다.
     * @param userBase 변환할 UserBase 엔티티
     * @return 변환된 UserDto
     */
    public static UserDto fromEntity(UserBase userBase) {
        return UserDto.builder()
                .userId(userBase.getUserId())
                .userNickname(userBase.getUserNickname())
                .profileImgUrl(userBase.getProfileImgUrl())
                .build();
    }

}