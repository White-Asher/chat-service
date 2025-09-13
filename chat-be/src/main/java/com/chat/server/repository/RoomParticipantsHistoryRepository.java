package com.chat.server.repository;

import com.chat.server.domain.RoomParticipantsHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomParticipantsHistoryRepository extends JpaRepository<RoomParticipantsHistory, Long> {
    Optional<RoomParticipantsHistory> findByChatRoom_RoomIdAndUserBase_UserId(Long roomId, Long userId);

    List<RoomParticipantsHistory> findByChatRoom_RoomIdAndQuitAtIsNull(Long roomId);

}
