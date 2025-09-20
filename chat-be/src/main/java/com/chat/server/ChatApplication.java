package com.chat.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 채팅 애플리케이션의 메인 클래스다.
 * Spring Boot 애플리케이션을 시작하고 JPA Auditing 기능을 활성화한다.
 */
@SpringBootApplication
@EnableJpaAuditing
public class ChatApplication {

    /**
     * 애플리케이션의 진입점이다.
     * Spring Boot 애플리케이션을 시작한다.
     * @param args 명령행 인수
     */
    public static void main(String[] args) {
        SpringApplication.run(ChatApplication.class, args);
    }

}
