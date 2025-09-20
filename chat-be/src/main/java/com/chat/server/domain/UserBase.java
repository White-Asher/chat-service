package com.chat.server.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * 사용자의 기본 프로필 정보를 저장하는 엔티티다.
 * 사용자 닉네임, 프로필 이미지 등 기본적인 사용자 정보를 관리한다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
public class UserBase {
    /**
     * 사용자 고유 식별자
     */
    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    /**
     * 사용자 닉네임 (필수, 최대 20자, 중복 불가)
     */
    @Column(nullable = false, length = 20, unique = true)
    private String userNickname;

    /**
     * 프로필 이미지 URL (선택, 최대 255자)
     */
    @Column(length = 255)
    private String profileImgUrl;

    /**
     * 사용자 생성 시간 (자동 설정, 수정 불가)
     */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * 사용자 정보 마지막 수정 시간 (자동 업데이트)
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}