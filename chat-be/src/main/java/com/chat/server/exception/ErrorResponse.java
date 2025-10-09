package com.chat.server.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ErrorResponse {

    private String errCd;
    private String errMsg;

    private ErrorResponse(final ErrorCode code) {
        this.errMsg = code.getMessage();
        this.errCd = code.getCode();
    }

    public static ErrorResponse of(final ErrorCode code) {
        return new ErrorResponse(code);
    }
}
