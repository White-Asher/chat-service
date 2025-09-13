package com.chat.server.repository;

import com.chat.server.domain.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    @Query("SELECT r FROM ChatRoom r JOIN r.participants p WHERE p.userBase.userId = :userId")
    List<ChatRoom> findChatRoomsByUserId(@Param("userId") Long userId);
}