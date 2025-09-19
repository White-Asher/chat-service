package com.chat.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestDto {
    private Long friendId;
    private Long requesterId;
    private String requesterNickname;

    @Data
    public static class SendRequest {
        private Long recipientId;
    }
}
