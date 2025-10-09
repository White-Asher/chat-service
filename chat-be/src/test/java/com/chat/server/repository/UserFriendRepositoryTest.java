package com.chat.server.repository;

import com.chat.server.domain.FriendStatus;
import com.chat.server.domain.UserBase;
import com.chat.server.domain.UserFriend;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserFriendRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserFriendRepository userFriendRepository;

    private UserBase user1;
    private UserBase user2;

    @BeforeEach
    void setUp() {
        user1 = new UserBase();
        user1.setUserNickname("user1");
        entityManager.persist(user1);

        user2 = new UserBase();
        user2.setUserNickname("user2");
        entityManager.persist(user2);
    }

    @Test
    @DisplayName("두 사용자 간의 친구 관계 찾기")
    void findByUser1AndUser2() {
        UserFriend userFriend = new UserFriend();
        userFriend.setUser1(user1);
        userFriend.setUser2(user2);
        userFriend.setRequester(user1);
        userFriend.setStatus(FriendStatus.PENDING);
        entityManager.persist(userFriend);

        Optional<UserFriend> foundFriendship = userFriendRepository.findByUser1AndUser2(user1, user2);

        assertThat(foundFriendship).isPresent();
        assertThat(foundFriendship.get().getUser1()).isEqualTo(user1);
        assertThat(foundFriendship.get().getUser2()).isEqualTo(user2);
    }

    @Test
    @DisplayName("두 사용자 간의 친구 관계 찾기 - 없는 관계")
    void findByUser1AndUser2_notFound() {
        Optional<UserFriend> foundFriendship = userFriendRepository.findByUser1AndUser2(user1, user2);

        assertThat(foundFriendship).isNotPresent();
    }
}
