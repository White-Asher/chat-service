package com.chat.server.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class MediaService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * 업로드된 파일을 저장하고, 저장된 파일의 전체 경로를 반환합니다.
     * 이 메소드는 Command Injection 실습을 위해 원본 파일명을 그대로 사용합니다.
     */
    public Path saveFileVulnerable(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        // 취약점: 원본 파일 이름을 그대로 사용
        Path filePath = uploadPath.resolve(file.getOriginalFilename());
        file.transferTo(filePath.toFile());
        return filePath;
    }

    /**
     * Command Injection에 취약한 썸네일 생성 메소드입니다.
     * 파일 경로를 문자열로 조합하여 시스템 명령어를 실행합니다.
     */
    public String generateThumbnailVulnerable(Path videoPath) throws IOException {
        StringBuilder output = new StringBuilder();
        String filename = videoPath.getFileName().toString(); // 전체 경로 대신 파일명만 사용
        String thumbnailFilename = filename + "_thumb.jpg";

        // 취약점의 핵심: 사용자 입력을 포함하는 파일명을 그대로 명령어 문자열에 합침
        String command = "ffmpeg -i " + filename + " -ss 00:00:01 -vframes 1 " + thumbnailFilename;

        output.append("--- 실행된 명령어 ---").append(command).append("\n\n");

        try {
            ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", command);
            builder.directory(Paths.get(uploadDir).toFile()); // 작업 디렉토리를 업로드 폴더로 설정
            
            Process process = builder.start();

            // 명령어의 표준/에러 출력을 함께 읽어옵니다.
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), "EUC-KR"))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream(), "EUC-KR"))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append("[ERROR] ").append(line).append("\n");
                }
            }

            process.waitFor();
        } catch (Exception e) {
            output.append("\n--- 예외 발생 ---").append(e.getMessage());
        }
        return output.toString();
    }

    // --- 보안이 적용된 안전한 로직 ---

    /**
     * 파일을 안전하게 저장합니다. UUID를 사용하여 파일명을 재작성하고, 원래 확장자를 유지합니다.
     */
    public Path saveFileSecure(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String safeFilename = UUID.randomUUID().toString() + "." + extension;
        
        Path filePath = uploadPath.resolve(safeFilename);
        file.transferTo(filePath.toFile());
        return filePath;
    }

    /**
     * Command Injection에 안전한 썸네일 생성 메소드입니다.
     * ProcessBuilder를 사용하고, 인자를 분리하여 전달합니다.
     */
    public String generateThumbnailSecure(Path videoPath) throws IOException {
        String thumbnailFilename = videoPath.getFileName().toString() + "_thumb.jpg";
        Path thumbnailPath = Paths.get(uploadDir).resolve(thumbnailFilename);

        // 안전한 방식: ProcessBuilder를 사용하고, 명령어와 인자를 명확히 분리
        ProcessBuilder builder = new ProcessBuilder(
                "ffmpeg",
                "-i",
                videoPath.toString(),
                "-ss",
                "00:00:01",
                "-vframes",
                "1",
                thumbnailPath.toString()
        );
        builder.redirectErrorStream(true);

        try {
            Process process = builder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                return reader.lines().reduce((acc, line) -> acc + "\n" + line).orElse("No output");
            }
        } catch (Exception e) {
            return "An error occurred: " + e.getMessage();
        }
    }
}
