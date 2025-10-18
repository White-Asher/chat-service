package com.chat.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;
import java.util.Arrays;

/**
 * Spring Security 설정을 담당하는 클래스다.
 * 인증/인가 규칙, CORS 설정, 비밀번호 암호화 등 보안 관련 설정을 관리한다.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * HTTP 보안 필터 체인을 구성한다.
     * 인증 규칙, CORS, CSRF 등의 보안 설정을 정의한다.
     * @param http HttpSecurity 객체
     * @return SecurityFilterChain 보안 필터 체인
     * @throws Exception 설정 과정에서 발생할 수 있는 예외
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/users/signup", "/api/users/login", "/api/users/me", "/ws/**", "/api/boards/**", "/api/boards**", "/uploads/**").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                );
        return http.build();
    }

    /**
     * CORS(Cross-Origin Resource Sharing) 설정을 구성한다.
     * 프론트엔드에서 API를 호출할 수 있도록 허용 도메인, 메서드, 헤더를 설정한다.
     * @return CorsConfigurationSource CORS 설정 소스
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // CSRF 취약점 실습을 위해 일시적으로 로컬 파일 출처(null)를 허용합니다. 실습 후 이 라인을 삭제하고 위 라인의 주석을 해제하세요.
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "null"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로에 대해 CORS 설정 적용
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * 비밀번호 암호화를 위한 인코더를 생성한다.
     * BCrypt 해시 알고리즘을 사용하여 비밀번호를 안전하게 암호화한다.
     * @return PasswordEncoder 비밀번호 인코더
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CSRF/CORS 실습을 위해 세션 쿠키의 SameSite 정책을 변경하는 쿠키 시리얼라이저를 설정합니다.
     * SameSite=None으로 설정하여 다른 출처(file://)에서도 쿠키가 전송되도록 허용합니다.
     * 주의: 실제 운영 환경에서는 SameSite=Lax 또는 Strict가 권장됩니다.
     * @return CookieSerializer 커스텀 쿠키 시리얼라이저
     */
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setSameSite("None");
        // HTTPS 환경이 아니므로 Secure 플래그는 false로 설정해야 SameSite=None이 동작합니다.
        serializer.setUseSecureCookie(false);
        return serializer;
    }

}
