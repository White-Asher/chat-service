package com.chat.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // STOMP를 사용하기 위해 선언하는 어노테이션
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 1. 메시지 브로커 설정
        // "/topic"으로 시작하는 경로를 구독하는 클라이언트에게 메시지를 전달합니다.
        registry.enableSimpleBroker("/topic");

        // 2. 클라이언트 -> 서버 메시지 라우팅 설정
        // "/app"으로 시작하는 경로로 들어온 메시지는 @MessageMapping이 붙은 메소드로 라우팅됩니다.
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 3. STOMP 연결을 위한 엔드포인트 설정
        // 클라이언트가 WebSocket 연결을 생성할 엔드포인트입니다.
        // SockJS를 지원하도록 설정하여 WebSocket을 사용할 수 없는 환경에서도 통신이 가능하게 합니다.
        registry.addEndpoint("/ws/chat")
                .setAllowedOrigins("http://localhost:5173") // React 개발 서버의 주소
                .withSockJS();
    }
}