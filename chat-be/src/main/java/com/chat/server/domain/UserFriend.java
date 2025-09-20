package com.chat.server.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 사용자 간 친구 관계를 저장하는 엔티티다.
 * 두 사용자 간의 친구 관계와 요청자, 상태 정보를 관리한다.
 * 친구 관계는 방향성이 없으므로 ID가 작은 사용자를 user1, 큰 사용자를 user2로 저장한다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "user_friends")
public class UserFriend {

    /**
     * 친구 관계 고유 식별자
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "friend_id")
    private Long friendId;

    /**
     * 첫 번째 사용자 (ID가 더 작은 사용자)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id1")
    private UserBase user1;

    /**
     * 두 번째 사용자 (ID가 더 큰 사용자)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id2")
    private UserBase user2;

    /**
     * 친구 요청을 보낸 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private UserBase requester;

    /**
     * 친구 관계 상태 (PENDING, ACCEPTED 등)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FriendStatus status;

    /**
     * 친구 관계 생성 시간 (자동 설정, 수정 불가)
     */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
