package com.chat.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chat.server.domain.ChatMessage;

import java.util.List;

/**
 * 채팅 메시지 엔티티에 대한 데이터 접근을 담당하는 Repository 인터페이스다.
 * 채팅 메시지의 저장, 조회, 수정, 삭제와 관련된 데이터베이스 작업을 처리한다.
 */
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    /**
     * 특정 채팅방의 모든 메시지를 생성 시간 순으로 조회한다.
     * 메시지는 시간 오름차순으로 정렬되어 반환된다.
     * @param roomId 조회할 채팅방 ID
     * @return 해당 채팅방의 메시지 목록 (생성 시간 오름차순)
     */
    List<ChatMessage> findByChatRoom_RoomIdOrderByCreatedAtAsc(Long roomId);
}
