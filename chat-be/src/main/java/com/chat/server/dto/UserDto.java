package com.chat.server.dto;

import com.chat.server.domain.UserBase;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor
public class UserDto {
    private Long userId;
    private String userNickname;
    private String profileImgUrl;

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

    @Builder
    public UserDto(Long userId, String userNickname) {
        this.userId = userId;
        this.userNickname = userNickname;
    }

    /**
     * UserBase 엔티티를 UserDto로 변환하는 정적 팩토리 메소드
     */
    public static UserDto fromEntity(UserBase userBase) {
        return UserDto.builder()
                .userId(userBase.getUserId())
                .userNickname(userBase.getUserNickname())
                .build();
    }

}