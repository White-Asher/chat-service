package com.chat.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chat.server.domain.ChatMessage;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoom_RoomIdOrderByCreatedAtAsc(Long roomId);
}
