package com.chat.server.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 채팅방 정보를 저장하는 엔티티다.
 * 채팅방의 기본 정보와 참여자 목록을 관리한다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
public class ChatRoom {
    /**
     * 채팅방 고유 식별자
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    /**
     * 채팅방 이름
     */
    private String roomName;

    /**
     * 채팅방 타입 ("ONE": 1대1 채팅, "GROUP": 그룹 채팅)
     */
    @Column(nullable = false, length = 10)
    private String roomType;

    /**
     * 채팅방 생성 시간 (자동 설정, 수정 불가)
     */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * 채팅방 정보 마지막 수정 시간 (자동 업데이트)
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * 채팅방 활성화 상태 ("Y": 활성, "N": 비활성)
     */
    @Column(length = 1, columnDefinition = "CHAR(1) DEFAULT 'Y'")
    private String isActive;

    /**
     * 채팅방 참여자 기록 목록 (일대다 관계)
     */
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomParticipantsHistory> participants = new ArrayList<>();
}