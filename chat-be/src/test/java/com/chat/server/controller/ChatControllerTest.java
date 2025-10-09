package com.chat.server.controller;

import com.chat.server.config.WithMockCustomUser;
import com.chat.server.domain.ChatRoom;
import com.chat.server.domain.UserBase;
import com.chat.server.dto.ChatRoomDto;
import com.chat.server.exception.CustomException;
import com.chat.server.exception.ErrorCode;
import com.chat.server.repository.ChatRoomRepository;
import com.chat.server.repository.UserBaseRepository;
import com.chat.server.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ChatService chatService;

    @Autowired
    private UserBaseRepository userBaseRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    private ChatRoomDto.CreateRequest createChatRoomRequest() {
        ChatRoomDto.CreateRequest request = new ChatRoomDto.CreateRequest();
        request.setRoomName("Test Room");
        request.setRoomType("GROUP");
        request.setUserNicknames(List.of("user1", "user2"));
        return request;
    }

    @BeforeEach
    void setUpTestData() {
        UserBase testUser = new UserBase();
        testUser.setUserNickname("user1");
        userBaseRepository.save(testUser);

        ChatRoom testRoom = new ChatRoom();
        testRoom.setRoomName("Test Room");
        testRoom.setRoomType("GROUP");
        chatRoomRepository.save(testRoom);
    }

    @Test
    @DisplayName("채팅방 생성 API 성공")
    @WithMockCustomUser
    void createChatRoom_success() throws Exception {
        // given
        ChatRoomDto.CreateRequest request = createChatRoomRequest();
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setRoomId(1L);
        chatRoom.setRoomName("Test Room");
        chatRoom.setRoomType("GROUP");
        ChatRoomDto responseDto = ChatRoomDto.fromEntity(chatRoom);
        when(chatService.createChatRoom(any(ChatRoomDto.CreateRequest.class))).thenReturn(responseDto);

        // when & then
        mockMvc.perform(post("/api/chat/room").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andDo(print());
    }

    @Test
    @DisplayName("채팅방 생성 API 실패 - 사용자를 찾을 수 없음")
    @WithMockCustomUser
    void createChatRoom_fail_userNotFound() throws Exception {
        // given
        ChatRoomDto.CreateRequest request = createChatRoomRequest();

        doThrow(new CustomException(ErrorCode.USER_NOT_FOUND))
                .when(chatService).createChatRoom(any(ChatRoomDto.CreateRequest.class));

        // when & then
        mockMvc.perform(post("/api/chat/room").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errCd").value(ErrorCode.USER_NOT_FOUND.getCode()))
                .andExpect(jsonPath("$.errMsg").value(ErrorCode.USER_NOT_FOUND.getMessage()))
                .andDo(print());
    }

    @Test
    @DisplayName("채팅방 나가기 API 성공")
    @WithMockCustomUser
    void leaveChatRoom_success() throws Exception {
        // given
        long roomId = 10L;
        long userId = 1L; // from @WithMockCustomUser
        doNothing().when(chatService).removeParticipant(anyLong(), anyLong());

        // when & then
        mockMvc.perform(post("/api/chat/room/{roomId}/leave", roomId).with(csrf()))
                .andExpect(status().isOk())
                .andDo(print());
    }
}