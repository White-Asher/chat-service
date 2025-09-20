package com.chat.server.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

/**
 * 채팅 메시지 정보를 저장하는 엔티티다.
 * 채팅방에서 주고받은 메시지의 내용과 발신자 정보를 관리한다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {
    /**
     * 메시지 고유 식별자
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    /**
     * 메시지가 속한 채팅방 (다대일 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom chatRoom;

    /**
     * 메시지를 보낸 사용자 (다대일 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserBase sender;

    /**
     * 메시지 내용 (텍스트 타입, 필수)
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String messageContent;

    /**
     * 메시지 생성 시간 (자동 설정, 수정 불가)
     */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
