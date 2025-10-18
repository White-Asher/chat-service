package com.chat.server.controller;

import com.chat.server.domain.Board;
import com.chat.server.dto.BoardDto;
import com.chat.server.repository.BoardRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
class BoardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BoardRepository boardRepository;

    @AfterEach
    void tearDown() {
        // 각 테스트 후 데이터베이스 정리
        boardRepository.deleteAll();
    }

    @Test
    @DisplayName("게시글을 성공적으로 생성하고 데이터베이스에 저장되는지 확인한다.")
    void shouldCreateBoardPostSuccessfully() throws Exception {
        // given
        BoardDto newPostDto = BoardDto.builder()
                .title("테스트 제목")
                .content("테스트 내용")
                .author("testuser")
                .build();

        // when
        MvcResult result = mockMvc.perform(post("/api/boards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPostDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("테스트 제목"))
                .andExpect(jsonPath("$.author").value("testuser"))
                .andReturn();

        // then
        System.out.println("Response: " + result.getResponse().getContentAsString());

        List<Board> boards = boardRepository.findAll();
        assertThat(boards).hasSize(1);
        Board savedBoard = boards.get(0);
        assertThat(savedBoard.getTitle()).isEqualTo("테스트 제목");
        assertThat(savedBoard.getAuthor()).isEqualTo("testuser");
    }
}
