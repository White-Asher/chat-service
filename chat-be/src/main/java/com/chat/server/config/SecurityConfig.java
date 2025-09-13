package com.chat.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정을 Security Filter Chain에 통합한다.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 2. CSRF 보호 기능을 비활성화한다. (API 서버에서는 보통 비활성화)
                .csrf(csrf -> csrf.disable())
                // 3. 요청에 대한 인가 규칙을 설정한다. (우선 모든 요청을 허용)
                .authorizeHttpRequests(authz -> authz
                        .anyRequest().permitAll()
                );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 4. 허용할 Origin(출처)을 명시적으로 지정한다.
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // 5. 허용할 HTTP 메서드를 지정한다.
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 6. 허용할 요청 헤더를 지정한다.
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // 7. 자격 증명(쿠키 등)을 허용한다.
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 8. /api/** 경로로 들어오는 모든 요청에 대해 위 설정을 적용한다.
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
