package com.chat.server.repository;

import com.chat.server.domain.UserBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserBaseRepositoryTest {

    @Autowired
    private UserBaseRepository userBaseRepository;

    @Test
    @DisplayName("닉네임으로 사용자 찾기")
    void findByUserNickname() {
        String nickname = "testnick";
        UserBase user = new UserBase();
        user.setUserNickname(nickname);
        userBaseRepository.save(user);

        Optional<UserBase> foundUser = userBaseRepository.findByUserNickname(nickname);

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUserNickname()).isEqualTo(nickname);
    }

    @Test
    @DisplayName("닉네임으로 사용자 찾기 - 없는 사용자")
    void findByUserNickname_notFound() {
        String nickname = "nonexistent";

        Optional<UserBase> foundUser = userBaseRepository.findByUserNickname(nickname);

        assertThat(foundUser).isNotPresent();
    }
}
