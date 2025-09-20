package com.chat.server.domain;

/**
 * 친구 관계의 상태를 나타내는 열거형이다.
 * 친구 요청의 진행 상황을 추적한다.
 */
public enum FriendStatus {
    /**
     * 친구 요청 대기 중 상태
     */
    PENDING,
    
    /**
     * 친구 요청 수락된 상태
     */
    ACCEPTED
}
