package com.chat.server.repository;

import com.chat.server.domain.ChatRoom;
import com.chat.server.domain.RoomParticipantsHistory;
import com.chat.server.domain.UserBase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ChatRoomRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private RoomParticipantsHistoryRepository participantsHistoryRepository;

    private UserBase user;
    private ChatRoom chatRoom1;
    private ChatRoom chatRoom2;

    @BeforeEach
    void setUp() {
        user = new UserBase();
        user.setUserNickname("testUser");
        entityManager.persist(user);

        chatRoom1 = new ChatRoom();
        chatRoom1.setRoomName("Room 1");
        chatRoom1.setRoomType("GROUP");
        entityManager.persist(chatRoom1);

        chatRoom2 = new ChatRoom();
        chatRoom2.setRoomName("Room 2");
        chatRoom2.setRoomType("GROUP");
        entityManager.persist(chatRoom2);

        RoomParticipantsHistory history1 = new RoomParticipantsHistory();
        history1.setChatRoom(chatRoom1);
        history1.setUserBase(user);
        history1.setJoinedAt(LocalDateTime.now());
        entityManager.persist(history1);

        RoomParticipantsHistory history2 = new RoomParticipantsHistory();
        history2.setChatRoom(chatRoom2);
        history2.setUserBase(user);
        history2.setJoinedAt(LocalDateTime.now());
        history2.setQuitAt(LocalDateTime.now());
        entityManager.persist(history2);
    }

    @Test
    @DisplayName("사용자가 참여중인 채팅방 목록 조회")
    void findChatRoomsByUserId() {
        List<ChatRoom> chatRooms = chatRoomRepository.findChatRoomsByUserId(user.getUserId());

        assertThat(chatRooms).hasSize(1);
        assertThat(chatRooms.get(0).getRoomName()).isEqualTo("Room 1");
    }
}
