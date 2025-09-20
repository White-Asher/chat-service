package com.chat.server.repository;

import com.chat.server.domain.FriendStatus;
import com.chat.server.domain.UserBase;
import com.chat.server.domain.UserFriend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 친구 관계 엔티티에 대한 데이터 접근을 담당하는 Repository 인터페이스다.
 * 친구 관계의 저장, 조회, 수정, 삭제와 친구 검색, 친구 요청 관리 등의 데이터베이스 작업을 처리한다.
 */
public interface UserFriendRepository extends JpaRepository<UserFriend, Long> {

    /**
     * 두 사용자 간의 친구 관계를 조회한다.
     * 친구 관계가 이미 존재하는지 확인할 때 사용한다.
     * @param user1 첫 번째 사용자 (ID가 더 작은 사용자)
     * @param user2 두 번째 사용자 (ID가 더 큰 사용자)
     * @return 친구 관계 (있을 경우)
     */
    Optional<UserFriend> findByUser1AndUser2(UserBase user1, UserBase user2);

    /**
     * 닉네임에 특정 문자열을 포함하고, 자신은 제외한 사용자 목록을 조회한다.
     * 친구 검색 기능에서 사용한다.
     * @param nickname 검색할 닉네임 문자열
     * @param userId 제외할 사용자 ID (자신)
     * @return 검색된 사용자 목록
     */
    @Query("SELECT u FROM UserBase u WHERE u.userNickname LIKE %:nickname% AND u.userId != :userId")
    List<UserBase> findByUserNicknameContainingAndUserIdNot(@Param("nickname") String nickname, @Param("userId") Long userId);

    /**
     * 특정 사용자를 user1으로 하는 특정 상태의 친구 관계를 조회한다.
     * @param user 조회할 사용자
     * @param status 조회할 친구 관계 상태
     * @return 해당 조건의 친구 관계 목록
     */
    List<UserFriend> findByUser1AndStatus(UserBase user, FriendStatus status);

    /**
     * 특정 사용자를 user2로 하는 특정 상태의 친구 관계를 조회한다.
     * @param user 조회할 사용자
     * @param status 조회할 친구 관계 상태
     * @return 해당 조건의 친구 관계 목록
     */
    List<UserFriend> findByUser2AndStatus(UserBase user, FriendStatus status);

    /**
     * 특정 사용자의 모든 친구를 조회한다.
     * user1 또는 user2 위치에 상관없이 ACCEPTED 상태인 친구 관계를 모두 조회한다.
     * @param user 친구 목록을 조회할 사용자
     * @return 해당 사용자의 친구 관계 목록
     */
    @Query("SELECT f FROM UserFriend f WHERE (f.user1 = :user OR f.user2 = :user) AND f.status = 'ACCEPTED'")
    List<UserFriend> findFriends(@Param("user") UserBase user);

    /**
     * 특정 사용자가 받은 대기 중인 친구 요청을 조회한다.
     * user2 위치에 있고 PENDING 상태인 친구 요청만 조회한다.
     * @param user 친구 요청을 받은 사용자
     * @return 대기 중인 친구 요청 목록
     */
    @Query("SELECT f FROM UserFriend f WHERE f.user2 = :user AND f.status = 'PENDING'")
    List<UserFriend> findPendingRequests(@Param("user") UserBase user);
}
