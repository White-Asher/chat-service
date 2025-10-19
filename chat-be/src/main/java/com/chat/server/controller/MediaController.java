package com.chat.server.controller;

import com.chat.server.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/upload-vulnerable")
    public ResponseEntity<String> uploadVulnerable(@RequestParam("file") MultipartFile file) {
        try {
            // 원본 파일명 그대로 저장
            Path savedPath = mediaService.saveFileVulnerable(file);
            // 취약한 썸네일 생성 로직 호출
            String result = mediaService.generateThumbnailVulnerable(savedPath);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("File processing failed: " + e.getMessage());
        }
    }

    @PostMapping("/upload-secure")
    public ResponseEntity<String> uploadSecure(@RequestParam("file") MultipartFile file) {
        try {
            // UUID로 파일명을 변경하여 안전하게 저장
            Path savedPath = mediaService.saveFileSecure(file);
            // 안전한 썸네일 생성 로직 호출
            String result = mediaService.generateThumbnailSecure(savedPath);
            return ResponseEntity.ok("Secure upload successful. Thumbnail generation result:\n" + result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("File processing failed: " + e.getMessage());
        }
    }
}
