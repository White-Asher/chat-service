package com.chat.server.service;

import com.chat.server.domain.FriendStatus;
import com.chat.server.domain.UserBase;
import com.chat.server.domain.UserFriend;
import com.chat.server.dto.FriendDto;
import com.chat.server.dto.FriendRequestDto;
import com.chat.server.repository.UserBaseRepository;
import com.chat.server.repository.UserFriendRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 친구 관리를 위한 비즈니스 로직을 처리하는 서비스다.
 * 친구 검색, 친구 요청 송수신, 수락/거절, 친구 삭제, 친구 목록 조회 등의 기능을 제공한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendService {

    private final UserFriendRepository userFriendRepository;
    private final UserBaseRepository userBaseRepository;

    /**
     * 닉네임으로 사용자를 검색한다.
     * 현재 사용자 자신은 검색 결과에서 제외한다.
     * @param nickname 검색할 닉네임
     * @param currentUserId 현재 사용자 ID
     * @return 검색된 사용자 목록
     */
    public List<FriendDto> searchUsers(String nickname, Long currentUserId) {
        return userBaseRepository.findByUserNicknameContainingAndUserIdNot(nickname, currentUserId)
                .stream()
                .map(user -> new FriendDto(user.getUserId(), user.getUserNickname()))
                .collect(Collectors.toList());
    }

    /**
     * 다른 사용자에게 친구 요청을 보낸다.
     * 이미 친구 관계가 존재하는지 확인하고, 없을 경우 PENDING 상태의 친구 요청을 생성한다.
     * @param requesterId 요청 보내는 사용자 ID
     * @param recipientId 요청 받는 사용자 ID
     * @throws IllegalArgumentException 요청자나 수신자를 찾을 수 없는 경우
     * @throws IllegalStateException 이미 친구 요청이 존재하거나 친구 관계인 경우
     */
    @Transactional
    public void sendFriendRequest(Long requesterId, Long recipientId) {
        UserBase requester = userBaseRepository.findById(requesterId).orElseThrow(() -> new IllegalArgumentException("Requester not found"));
        UserBase recipient = userBaseRepository.findById(recipientId).orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        UserBase user1 = requesterId < recipientId ? requester : recipient;
        UserBase user2 = requesterId < recipientId ? recipient : requester;

        userFriendRepository.findByUser1AndUser2(user1, user2).ifPresent(f -> {
            throw new IllegalStateException("Friend request already exists or they are already friends.");
        });

        UserFriend userFriend = new UserFriend();
        userFriend.setUser1(user1);
        userFriend.setUser2(user2);
        userFriend.setRequester(requester);
        userFriend.setStatus(FriendStatus.PENDING);
        userFriendRepository.save(userFriend);
    }

    /**
     * 받은 친구 요청을 수락한다.
     * 친구 요청의 상태를 ACCEPTED로 변경한다.
     * @param friendId 수락할 친구 관계 ID
     * @throws IllegalArgumentException 친구 요청을 찾을 수 없는 경우
     */
    @Transactional
    public void acceptFriendRequest(Long friendId) {
        UserFriend userFriend = userFriendRepository.findById(friendId).orElseThrow(() -> new IllegalArgumentException("Friend request not found"));
        userFriend.setStatus(FriendStatus.ACCEPTED);
        userFriendRepository.save(userFriend);
    }

    /**
     * 받은 친구 요청을 거절한다.
     * 친구 요청을 데이터베이스에서 삭제한다.
     * @param friendId 거절할 친구 관계 ID
     */
    @Transactional
    public void rejectFriendRequest(Long friendId) {
        userFriendRepository.deleteById(friendId);
    }

    /**
     * 기존 친구를 삭제한다.
     * 두 사용자 간의 친구 관계를 데이터베이스에서 삭제한다.
     * @param userId 현재 사용자 ID
     * @param friendToRemoveId 삭제할 친구의 ID
     * @throws IllegalArgumentException 사용자를 찾을 수 없거나 친구 관계를 찾을 수 없는 경우
     */
    @Transactional
    public void removeFriend(Long userId, Long friendToRemoveId) {
        UserBase user = userBaseRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserBase friendToRemove = userBaseRepository.findById(friendToRemoveId).orElseThrow(() -> new IllegalArgumentException("Friend not found"));

        UserBase user1 = userId < friendToRemoveId ? user : friendToRemove;
        UserBase user2 = userId < friendToRemoveId ? friendToRemove : user;

        UserFriend userFriend = userFriendRepository.findByUser1AndUser2(user1, user2)
                .orElseThrow(() -> new IllegalArgumentException("Friendship not found"));

        userFriendRepository.delete(userFriend);
    }

    /**
     * 현재 사용자의 친구 목록을 조회한다.
     * ACCEPTED 상태인 친구 관계만 조회한다.
     * @param userId 조회할 사용자 ID
     * @return 친구 목록
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    public List<FriendDto> getFriendList(Long userId) {
        UserBase user = userBaseRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        List<UserFriend> friends1 = userFriendRepository.findByUser1AndStatus(user, FriendStatus.ACCEPTED);
        List<UserFriend> friends2 = userFriendRepository.findByUser2AndStatus(user, FriendStatus.ACCEPTED);

        return Stream.concat(friends1.stream(), friends2.stream())
                .map(friendship -> {
                    UserBase friendUser = friendship.getUser1().equals(user) ? friendship.getUser2() : friendship.getUser1();
                    return new FriendDto(friendUser.getUserId(), friendUser.getUserNickname());
                })
                .collect(Collectors.toList());
    }

    /**
     * 현재 사용자가 받은 대기 중인 친구 요청 목록을 조회한다.
     * @param userId 조회할 사용자 ID
     * @return 대기 중인 친구 요청 목록
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    public List<FriendRequestDto> getPendingFriendRequests(Long userId) {
        UserBase user = userBaseRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return userFriendRepository.findPendingRequests(user)
                .stream()
                .map(request -> new FriendRequestDto(request.getFriendId(), request.getRequester().getUserId(), request.getRequester().getUserNickname()))
                .collect(Collectors.toList());
    }
}
