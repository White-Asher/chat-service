package com.chat.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket 통신을 위한 설정을 담당하는 클래스다.
 * STOMP 프로토콜을 사용한 실시간 채팅 기능을 위한 메시지 브로커와 엔드포인트를 구성한다.
 */
@Configuration
@EnableWebSocketMessageBroker // STOMP를 사용하기 위해 선언하는 어노테이션
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * 메시지 브로커를 구성한다.
     * 클라이언트 구독 경로와 서버로 메시지를 보낼 경로의 접두사를 설정한다.
     * @param registry 메시지 브로커 레지스트리
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // "/topic"으로 시작하는 경로를 구독하는 클라이언트에게 메시지를 전달한다
        registry.enableSimpleBroker("/topic");

        // "/app"으로 시작하는 경로로 들어온 메시지는 @MessageMapping이 붙은 메서드로 라우팅된다
        registry.setApplicationDestinationPrefixes("/app");
    }

    /**
     * STOMP 엔드포인트를 등록한다.
     * 클라이언트가 WebSocket 연결을 위해 접속할 엔드포인트를 설정한다.
     * @param registry STOMP 엔드포인트 레지스트리
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트가 WebSocket 연결을 생성할 엔드포인트를 설정한다
        // SockJS를 지원하여 WebSocket을 사용할 수 없는 환경에서도 통신이 가능하다
        registry.addEndpoint("/ws/chat")
                .setAllowedOrigins("http://localhost:5173") // React 개발 서버의 주소
                .withSockJS();
    }
}