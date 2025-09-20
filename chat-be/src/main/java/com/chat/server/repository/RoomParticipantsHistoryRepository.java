package com.chat.server.repository;

import com.chat.server.domain.RoomParticipantsHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 채팅방 참여자 기록 엔티티에 대한 데이터 접근을 담당하는 Repository 인터페이스다.
 * 채팅방 참여/퇴장 기록의 저장, 조회와 관련된 데이터베이스 작업을 처리한다.
 */
public interface RoomParticipantsHistoryRepository extends JpaRepository<RoomParticipantsHistory, Long> {
    
    /**
     * 특정 채팅방에서 특정 사용자의 참여 기록을 조회한다.
     * 해당 사용자가 그 방에 참여한 기록이 있는지 확인할 때 사용한다.
     * @param roomId 채팅방 ID
     * @param userId 사용자 ID
     * @return 참여 기록 (있을 경우)
     */
    Optional<RoomParticipantsHistory> findByChatRoom_RoomIdAndUserBase_UserId(Long roomId, Long userId);

    /**
     * 특정 채팅방의 현재 참여자들의 기록을 조회한다.
     * 퇴장하지 않은 사용자들만 조회한다.
     * @param roomId 채팅방 ID
     * @return 현재 참여 중인 사용자들의 참여 기록 목록
     */
    List<RoomParticipantsHistory> findByChatRoom_RoomIdAndQuitAtIsNull(Long roomId);

    /**
     * 특정 채팅방에서 특정 사용자의 활성 상태 참여 기록을 조회한다.
     * 현재 참여 중인지 확인할 때 사용한다.
     * @param roomId 채팅방 ID
     * @param userId 사용자 ID
     * @return 현재 활성 상태인 참여 기록 (있을 경우)
     */
    Optional<RoomParticipantsHistory> findByChatRoom_RoomIdAndUserBase_UserIdAndQuitAtIsNull(Long roomId, Long userId);

    /**
     * 특정 채팅방에서 특정 사용자의 가장 최근 참여 기록을 조회한다.
     * 재초대 시 이전 기록을 재활용할 때 사용한다.
     * @param roomId 채팅방 ID
     * @param userId 사용자 ID
     * @return 가장 최근 참여 기록 (있을 경우)
     */
    Optional<RoomParticipantsHistory> findFirstByChatRoom_RoomIdAndUserBase_UserIdOrderByJoinedAtDesc(Long roomId, Long userId);

    /**
     * 특정 채팅방의 모든 참여 기록을 입장 시간 역순으로 조회한다.
     * 참여자 기록 조회 API에서 사용한다.
     * @param roomId 채팅방 ID
     * @return 모든 참여 기록 목록 (입장 시간 역순)
     */
    List<RoomParticipantsHistory> findByChatRoom_RoomIdOrderByJoinedAtDesc(Long roomId);

    /**
     * 특정 사용자가 현재 참여하고 있는 모든 채팅방의 참여 기록을 조회한다.
     * 사용자의 채팅방 목록을 조회할 때 사용한다.
     * @param userId 사용자 ID
     * @return 현재 참여 중인 채팅방의 참여 기록 목록
     */
    List<RoomParticipantsHistory> findByUserBase_UserIdAndQuitAtIsNull(Long userId);

}