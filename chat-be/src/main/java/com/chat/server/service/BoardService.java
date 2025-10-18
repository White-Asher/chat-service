package com.chat.server.service;

import com.chat.server.domain.Board;
import com.chat.server.dto.BoardDto;
import com.chat.server.repository.BoardRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public BoardDto createBoard(BoardDto boardDto) {

        // [취약한 코드] 사용자 입력을 그대로 저장하여 XSS 공격에 노출됨
        /*
        Board boardVulnerable = Board.builder()
                .title(boardDto.getTitle())
                .content(boardDto.getContent())
                .author(boardDto.getAuthor())
                .build();
        return BoardDto.fromEntity(boardRepository.save(boardVulnerable));
        */

        // [안전한 코드] HTML Sanitizer를 사용하여 XSS 공격 방어
        // Sanitizers.BLOCKS 정책: <p>, <h1>, <div> 등 기본적인 블록 태그만 허용하고, <img>, <script> 등은 모두 제거합니다.
        PolicyFactory policy = Sanitizers.BLOCKS;
        String sanitizedContent = policy.sanitize(boardDto.getContent());

        Board board = Board.builder()
                .title(boardDto.getTitle())
                .content(sanitizedContent) // 소독된 내용을 저장
                .author(boardDto.getAuthor())
                .build();
        return BoardDto.fromEntity(boardRepository.save(board));
    }

    public List<BoardDto> findAll() {
        return boardRepository.findAll().stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());
    }

    // SQL Injection에 취약한 검색 메서드
    public List<BoardDto> searchByAuthorVulnerable(String author) {
        return boardRepository.findByAuthorVulnerable(author).stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());
    }

    // SQL Injection에 안전한 검색 메서드
    public List<BoardDto> searchByAuthorSafe(String author) {
        return boardRepository.findByAuthor(author).stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 진짜 SQL Injection에 취약한 검색 메서드 (학습용)
    @SuppressWarnings("unchecked")
    public List<BoardDto> searchByAuthorTrulyVulnerable(String author) {
        // 중요: 이것은 SQL 인젝션에 매우 취약한 코드 예시입니다.
        // 실제 운영 환경에서는 절대 이렇게 작성하면 안 됩니다.
        String sql = "SELECT * FROM board WHERE author = '" + author + "'";
        List<Board> boards = entityManager.createNativeQuery(sql, Board.class).getResultList();
        return boards.stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());
    }

    // --- 파일 업로드 로직 ---

    @Transactional
    public BoardDto createBoardWithVulnerableUpload(BoardDto boardDto, MultipartFile file) throws IOException {

        // 1. 업로드 디렉토리 경로 객체를 생성합니다.
        Path uploadDirPath = Paths.get(uploadDir);

        // 2. 디렉토리가 존재하지 않으면 생성합니다.
        if (!Files.exists(uploadDirPath)) {
            Files.createDirectories(uploadDirPath); // 부모 디렉토리까지 모두 생성
        }

        

        String originalFilename = file.getOriginalFilename();

        // 아무런 검증 없이 원본 파일 이름 그대로 저장
        Path targetPath = Paths.get(uploadDir, originalFilename);
        file.transferTo(targetPath);

        Board board = Board.builder()
                .title(boardDto.getTitle())
                .content(boardDto.getContent())
                .author(boardDto.getAuthor())
                .attachedFilename(originalFilename)
                .build();

        return BoardDto.fromEntity(boardRepository.save(board));
    }

    @Transactional
    public BoardDto createBoardWithSecureUpload(BoardDto boardDto, MultipartFile file) throws IOException {
        // 1. 파일 확장자 검증
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (!isExtensionAllowed(extension)) {
            throw new IllegalArgumentException("허용되지 않는 파일 확장자입니다.");
        }

        // 2. 파일 이름을 랜덤 UUID로 생성 (Path Traversal 방지)
        String randomFilename = UUID.randomUUID().toString() + "." + extension;

        // 3. 파일 저장
        Path targetPath = Paths.get(uploadDir, randomFilename);
        file.transferTo(targetPath);

        Board board = Board.builder()
                .title(boardDto.getTitle())
                .content(boardDto.getContent())
                .author(boardDto.getAuthor())
                .attachedFilename(randomFilename)
                .build();

        return BoardDto.fromEntity(boardRepository.save(board));
    }

    private boolean isExtensionAllowed(String extension) {
        if (extension == null) {
            return false;
        }
        // 허용할 확장자 목록 (Whitelist)
        List<String> allowedExtensions = Arrays.asList("txt", "jpg", "jpeg", "png", "gif");
        return allowedExtensions.contains(extension.toLowerCase());
    }
}
