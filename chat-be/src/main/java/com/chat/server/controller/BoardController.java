package com.chat.server.controller;

import com.chat.server.dto.BoardDto;
import com.chat.server.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping
    public ResponseEntity<BoardDto> createBoard(@RequestBody BoardDto boardDto) {
        return ResponseEntity.ok(boardService.createBoard(boardDto));
    }

    @GetMapping
    public ResponseEntity<List<BoardDto>> findAll() {
        return ResponseEntity.ok(boardService.findAll());
    }

    // --- 파일 업로드 엔드포인트 ---

    @PostMapping(value = "/vulnerable-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BoardDto> vulnerableUpload(@RequestPart("board") BoardDto boardDto, @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(boardService.createBoardWithVulnerableUpload(boardDto, file));
    }

    @PostMapping(value = "/secure-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BoardDto> secureUpload(@RequestPart("board") BoardDto boardDto, @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(boardService.createBoardWithSecureUpload(boardDto, file));
    }

    // SQL Injection에 취약한 엔드포인트
    @GetMapping("/search/vulnerable")
    public ResponseEntity<List<BoardDto>> searchVulnerable(@RequestParam String author) {
        return ResponseEntity.ok(boardService.searchByAuthorVulnerable(author));
    }

    // SQL Injection에 안전한 엔드포인트
    @GetMapping("/search/safe")
    public ResponseEntity<List<BoardDto>> searchSafe(@RequestParam String author) {
        return ResponseEntity.ok(boardService.searchByAuthorSafe(author));
    }

    // 진짜 SQL Injection에 취약한 엔드포인트 (학습용)
    @GetMapping("/search/truly-vulnerable")
    public ResponseEntity<List<BoardDto>> searchTrulyVulnerable(@RequestParam String author) {
        return ResponseEntity.ok(boardService.searchByAuthorTrulyVulnerable(author));
    }

    // 파일 다운로드 예제 엔드포인트 (SQL Injection과는 별개)
    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam String filename) throws FileNotFoundException {
        // 중요: 실제 프로덕션 환경에서는 파일 경로를 외부 입력으로 직접 받으면
        // Path Traversal 공격에 매우 취약합니다. 여기서는 예시로만 보여드립니다.
        // String safePath = Paths.get("/path/to/safe/dir/").resolve(filename).normalize().toString();
        // if (!safePath.startsWith("/path/to/safe/dir/")) { throw new SecurityException("Invalid path"); }

        File file = new File("C:/Users/dkxmp/Documents/Github/chat-mini/" + filename); // 예시 경로
        InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
