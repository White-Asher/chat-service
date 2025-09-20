package com.chat.server.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * 전역 예외 처리를 담당하는 컨트롤러다.
 * 애플리케이션에서 발생하는 다양한 예외를 일관된 형태의 응답으로 변환하여 클라이언트에게 전달한다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  /**
   * 엔티티를 찾을 수 없는 예외를 처리한다.
   * @param ex 발생한 EntityNotFoundException
   * @return 404 NOT_FOUND 상태와 에러 메시지를 담은 응답
   */
  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleEntityNotFoundException(EntityNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
  }

  /**
   * 잘못된 인자 예외를 처리한다.
   * @param ex 발생한 IllegalArgumentException
   * @return 400 BAD_REQUEST 상태와 에러 메시지를 담은 응답
   */
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
  }

  /**
   * 메서드 인자 유효성 검사 실패 예외를 처리한다.
   * @param ex 발생한 MethodArgumentNotValidException
   * @return 400 BAD_REQUEST 상태와 필드별 에러 메시지를 담은 응답
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
    Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
        .collect(Collectors.toMap(
            fieldError -> fieldError.getField(),
            fieldError -> fieldError.getDefaultMessage()));
    return ResponseEntity.badRequest().body(Map.of("errors", errors));
  }

  /**
   * 기타 모든 예외를 처리한다.
   * 예상하지 못한 예외가 발생했을 때 로그를 남기고 일반적인 에러 메시지를 반환한다.
   * @param ex 발생한 Exception
   * @return 500 INTERNAL_SERVER_ERROR 상태와 일반 에러 메시지를 담은 응답
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
    // 디버깅을 위해 예외 로그를 출력한다
    ex.printStackTrace();
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("error", "An unexpected error occurred."));
  }
}
