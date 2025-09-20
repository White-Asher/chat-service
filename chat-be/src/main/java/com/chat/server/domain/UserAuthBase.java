package com.chat.server.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * 사용자의 인증 정보를 저장하는 엔티티다.
 * 로그인 ID, 암호화된 비밀번호 등 인증과 관련된 정보를 관리한다.
 * UserBase와 일대일 관계를 가진다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "user_auth_base")
public class UserAuthBase {

    /**
     * 인증 정보 고유 식별자
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auth_seq")
    private Long authSeq;

    /**
     * 로그인 ID (필수, 최대 50자, 중복 불가)
     */
    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginId;

    /**
     * 암호화된 비밀번호 (필수, 최대 255자)
     */
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    /**
     * 연결된 사용자 프로필 정보 (일대일 관계)
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_base_id", referencedColumnName = "user_id", unique = true)
    private UserBase userBase;

    /**
     * 인증 정보 생성 시간
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * 인증 정보 마지막 수정 시간
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}