package com.chat.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 친구 요청 정보를 담는 DTO 클래스다.
 * 대기 중인 친구 요청 목록 조회 응답에 사용된다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestDto {
    /**
     * 친구 관계 고유 식별자
     */
    private Long friendId;
    
    /**
     * 친구 요청을 보낸 사용자 ID
     */
    private Long requesterId;
    
    /**
     * 친구 요청을 보낸 사용자의 닉네임
     */
    private String requesterNickname;

    /**
     * 친구 요청 전송 데이터를 담는 DTO 클래스다.
     * 친구 요청을 받을 사용자의 ID를 포함한다.
     */
    @Data
    public static class SendRequest {
        /**
         * 친구 요청을 받을 사용자 ID
         */
        private Long recipientId;
    }
}
