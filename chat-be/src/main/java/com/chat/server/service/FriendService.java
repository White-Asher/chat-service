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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendService {

    private final UserFriendRepository userFriendRepository;
    private final UserBaseRepository userBaseRepository;

    public List<FriendDto> searchUsers(String nickname, Long currentUserId) {
        return userFriendRepository.findByUserNicknameContainingAndUserIdNot(nickname, currentUserId)
                .stream()
                .map(user -> new FriendDto(user.getUserId(), user.getUserNickname()))
                .collect(Collectors.toList());
    }

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

    @Transactional
    public void acceptFriendRequest(Long friendId) {
        UserFriend userFriend = userFriendRepository.findById(friendId).orElseThrow(() -> new IllegalArgumentException("Friend request not found"));
        userFriend.setStatus(FriendStatus.ACCEPTED);
        userFriendRepository.save(userFriend);
    }

    @Transactional
    public void rejectFriendRequest(Long friendId) {
        userFriendRepository.deleteById(friendId);
    }

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

    public List<FriendRequestDto> getPendingFriendRequests(Long userId) {
        UserBase user = userBaseRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return userFriendRepository.findPendingRequests(user)
                .stream()
                .map(request -> new FriendRequestDto(request.getFriendId(), request.getRequester().getUserId(), request.getRequester().getUserNickname()))
                .collect(Collectors.toList());
    }
}
