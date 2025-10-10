package com.chat.server.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "유효하지 않은 입력 값입니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C002", "허용되지 않은 메소드입니다."),
    ENTITY_NOT_FOUND(HttpStatus.NOT_FOUND, "C003", "엔티티를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C004", "서버 오류"),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "C005", "유효하지 않은 타입 값입니다."),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "사용자를 찾을 수 없습니다."),
    DUPLICATE_NICKNAME(HttpStatus.BAD_REQUEST, "U002", "이미 사용중인 닉네임입니다."),
    DUPLICATE_LOGIN_ID(HttpStatus.BAD_REQUEST, "U003", "이미 사용중인 아이디입니다."),
    LOGIN_INPUT_INVALID(HttpStatus.BAD_REQUEST, "U004", "로그인 정보가 올바르지 않습니다."),
    SAME_AS_CURRENT_NICKNAME(HttpStatus.BAD_REQUEST, "U005", "현재 닉네임과 동일합니다."),

    // Friend
    FRIEND_REQUEST_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "F001", "이미 친구 요청을 보냈거나 친구 관계입니다."),
    FRIEND_REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "F002", "친구 요청을 찾을 수 없습니다."),
    FRIENDSHIP_NOT_FOUND(HttpStatus.NOT_FOUND, "F003", "친구 관계를 찾을 수 없습니다."),
    CANNOT_FRIEND_YOURSELF(HttpStatus.BAD_REQUEST, "F004", "자기 자신을 친구로 추가할 수 없습니다."),

    // Chat
    CHAT_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "CH001", "채팅방을 찾을 수 없습니다."),
    USER_ALREADY_IN_CHAT_ROOM(HttpStatus.BAD_REQUEST, "CH002", "이미 채팅방에 참여중인 사용자입니다."),
    INVALID_INVITATION(HttpStatus.BAD_REQUEST, "CH003", "자기 자신을 채팅방에 초대할 수 없습니다.");


    private final HttpStatus status;
    private final String code;
    private final String message;
}
