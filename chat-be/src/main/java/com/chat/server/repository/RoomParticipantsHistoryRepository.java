package com.chat.server.repository;

import com.chat.server.domain.RoomParticipantsHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomParticipantsHistoryRepository extends JpaRepository<RoomParticipantsHistory, Long> {
    Optional<RoomParticipantsHistory> findByChatRoom_RoomIdAndUserBase_UserId(Long roomId, Long userId);

    List<RoomParticipantsHistory> findByChatRoom_RoomIdAndQuitAtIsNull(Long roomId);

    // 특정 방, 특정 유저의 '활성'된 참여 정보를 찾기 위한 메소드
    Optional<RoomParticipantsHistory> findByChatRoom_RoomIdAndUserBase_UserIdAndQuitAtIsNull(Long roomId, Long userId);

    // 특정 방, 특정 유저의 '가장 최근' 참여 정보를 찾기 위한 메소드
    Optional<RoomParticipantsHistory> findFirstByChatRoom_RoomIdAndUserBase_UserIdOrderByJoinedAtDesc(Long roomId, Long userId);

    // 특정 방의 모든 참여 기록을 입장 시간 역순으로 조회
    List<RoomParticipantsHistory> findByChatRoom_RoomIdOrderByJoinedAtDesc(Long roomId);

    // 사용자가 현재 참여하고 있는(나가지 않은) 모든 참여 기록 조회
    List<RoomParticipantsHistory> findByUserBase_UserIdAndQuitAtIsNull(Long userId);

}