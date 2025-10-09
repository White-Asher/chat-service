package com.chat.server.repository;

import com.chat.server.domain.ChatMessage;
import com.chat.server.domain.ChatRoom;
import com.chat.server.domain.UserBase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ChatMessageRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    private ChatRoom chatRoom;

    @BeforeEach
    void setUp() {
        UserBase user = new UserBase();
        user.setUserNickname("testUser");
        entityManager.persist(user);

        chatRoom = new ChatRoom();
        chatRoom.setRoomName("Test Room");
        chatRoom.setRoomType("GROUP");
        entityManager.persist(chatRoom);

        ChatMessage message1 = new ChatMessage();
        message1.setChatRoom(chatRoom);
        message1.setSender(user);
        message1.setMessageContent("Hello");
        entityManager.persist(message1);

        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            System.err.println("Thread interrupted: " + e.getMessage());
        }

        ChatMessage message2 = new ChatMessage();
        message2.setChatRoom(chatRoom);
        message2.setSender(user);
        message2.setMessageContent("World");
        entityManager.persist(message2);
    }

    @Test
    @DisplayName("채팅방 메시지 시간순으로 조회")
    void findByChatRoom_RoomIdOrderByCreatedAtAsc() {
        List<ChatMessage> messages = chatMessageRepository.findByChatRoom_RoomIdOrderByCreatedAtAsc(chatRoom.getRoomId());

        assertThat(messages).hasSize(2);
        assertThat(messages.get(0).getMessageContent()).isEqualTo("Hello");
        assertThat(messages.get(1).getMessageContent()).isEqualTo("World");
    }
}