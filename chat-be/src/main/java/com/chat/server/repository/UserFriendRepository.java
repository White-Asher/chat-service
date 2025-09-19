package com.chat.server.repository;

import com.chat.server.domain.FriendStatus;
import com.chat.server.domain.UserBase;
import com.chat.server.domain.UserFriend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserFriendRepository extends JpaRepository<UserFriend, Long> {

    Optional<UserFriend> findByUser1AndUser2(UserBase user1, UserBase user2);

    @Query("SELECT u FROM UserBase u WHERE u.userNickname LIKE %:nickname% AND u.userId != :userId")
    List<UserBase> findByUserNicknameContainingAndUserIdNot(@Param("nickname") String nickname, @Param("userId") Long userId);

    List<UserFriend> findByUser1AndStatus(UserBase user, FriendStatus status);

    List<UserFriend> findByUser2AndStatus(UserBase user, FriendStatus status);

    @Query("SELECT f FROM UserFriend f WHERE (f.user1 = :user OR f.user2 = :user) AND f.status = 'ACCEPTED'")
    List<UserFriend> findFriends(@Param("user") UserBase user);

    @Query("SELECT f FROM UserFriend f WHERE f.user2 = :user AND f.status = 'PENDING'")
    List<UserFriend> findPendingRequests(@Param("user") UserBase user);
}
