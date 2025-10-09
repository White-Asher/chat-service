package com.chat.server.config;

import com.chat.server.dto.UserDto;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

public class WithMockCustomUserSecurityContextFactory implements WithSecurityContextFactory<WithMockCustomUser> {

    @Override
    public SecurityContext createSecurityContext(WithMockCustomUser customUser) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        UserDto mockUser = UserDto.builder()
                .userId(customUser.userId())
                .userNickname(customUser.userNickname())
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(mockUser, null, null);
        context.setAuthentication(auth);
        return context;
    }
}
