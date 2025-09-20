package com.chat.server.repository;

import com.chat.server.domain.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

/**
 * 채팅방 엔티티에 대한 데이터 접근을 담당하는 Repository 인터페이스다.
 * 채팅방의 저장, 조회, 수정, 삭제와 관련된 데이터베이스 작업을 처리한다.
 */
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    /**
     * 특정 사용자가 현재 참여 중인 모든 채팅방을 조회한다.
     * 사용자가 퇴장하지 않은 채팅방만 조회한다.
     * @param userId 조회할 사용자 ID
     * @return 사용자가 참여 중인 채팅방 목록
     */
    @Query("SELECT r FROM ChatRoom r JOIN r.participants p WHERE p.userBase.userId = :userId AND p.quitAt IS NULL")
    List<ChatRoom> findChatRoomsByUserId(@Param("userId") Long userId);
}