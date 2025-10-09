package com.chat.server.controller;

import com.chat.server.config.WithMockCustomUser;
import com.chat.server.dto.FriendRequestDto;
import com.chat.server.exception.CustomException;
import com.chat.server.exception.ErrorCode;
import com.chat.server.service.FriendService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FriendControllerTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FriendService friendService;

    private FriendRequestDto.SendRequest createSendRequest(long recipientId) {
        FriendRequestDto.SendRequest request = new FriendRequestDto.SendRequest();
        request.setRecipientId(recipientId);
        return request;
    }

    @Test
    @DisplayName("친구 요청 보내기 API 성공")
    @WithMockCustomUser
    void sendFriendRequest_success() throws Exception {
        // given
        long recipientId = 2L;
        FriendRequestDto.SendRequest request = createSendRequest(recipientId);

        doNothing().when(friendService).sendFriendRequest(anyLong(), anyLong());

        // when & then
        mockMvc.perform(post("/api/friends/requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andDo(print());
    }

    @Test
    @DisplayName("친구 요청 보내기 API 실패 - 이미 친구 또는 요청 존재")
    @WithMockCustomUser
    void sendFriendRequest_fail_alreadyExists() throws Exception {
        // given
        long recipientId = 2L;
        FriendRequestDto.SendRequest request = createSendRequest(recipientId);
        doThrow(new CustomException(ErrorCode.FRIEND_REQUEST_ALREADY_EXISTS))
                .when(friendService).sendFriendRequest(anyLong(), anyLong());

        // when & then
        mockMvc.perform(post("/api/friends/requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errCd").value(ErrorCode.FRIEND_REQUEST_ALREADY_EXISTS.getCode()))
                .andExpect(jsonPath("$.errMsg").value(ErrorCode.FRIEND_REQUEST_ALREADY_EXISTS.getMessage()))
                .andDo(print());
    }
}