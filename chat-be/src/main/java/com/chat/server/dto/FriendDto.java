package com.chat.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 친구 정보를 담는 DTO 클래스다.
 * 친구 검색 결과와 친구 목록 응답에 사용된다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendDto {
    /**
     * 친구의 사용자 ID
     */
    private Long userId;
    
    /**
     * 친구의 닉네임
     */
    private String userNickname;
}
