package com.chat.server.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

/**
 * 채팅방 참여자의 입장/퇴장 기록을 저장하는 엔티티다.
 * 사용자가 언제 채팅방에 입장했고 언제 나갔는지 이력을 관리한다.
 * quitAt이 null이면 현재 참여 중인 상태를 의미한다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
public class RoomParticipantsHistory {
    /**
     * 참여자 기록 고유 식별자
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long participantId;

    /**
     * 참여한 채팅방 (다대일 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom chatRoom;

    /**
     * 참여한 사용자 (다대일 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserBase userBase;

    /**
     * 기록 생성 시간 (자동 설정, 수정 불가)
     */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * 채팅방 입장 시간 (필수)
     */
    @Column(nullable = false)
    private LocalDateTime joinedAt;

    /**
     * 채팅방 퇴장 시간 (null이면 현재 참여 중)
     */
    private LocalDateTime quitAt;
}
