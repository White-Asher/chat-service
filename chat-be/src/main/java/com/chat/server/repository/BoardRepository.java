package com.chat.server.repository;

import com.chat.server.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {

    // 취약한 메서드: SQL Injection에 노출될 수 있음
    @Query(value = "SELECT * FROM board WHERE author = :author", nativeQuery = true)
    List<Board> findByAuthorVulnerable(@Param("author") String author);

    // 안전한 메서드: Parameterized Query 사용
    List<Board> findByAuthor(String author);

}
