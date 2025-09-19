package com.chat.server.dto;

import com.chat.server.domain.UserBase;
import lombok.*;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long userId;
    private String userNickname;
    private String profileImgUrl;
    private Long sessionTimeoutInMinutes;

    @Getter
    @Setter
    public static class CreateRequest {
        private String userNickname;
        private String profileImgUrl;
    }

    @Getter
    @Setter
    public static class UpdateRequest {
        private String userNickname;
        private String profileImgUrl;
    }

    /**
     * UserBase 엔티티를 UserDto로 변환하는 정적 팩토리 메소드
     */
    public static UserDto fromEntity(UserBase userBase) {
        return UserDto.builder()
                .userId(userBase.getUserId())
                .userNickname(userBase.getUserNickname())
                .profileImgUrl(userBase.getProfileImgUrl())
                .build();
    }

}