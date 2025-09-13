package com.chat.server.repository;


import com.chat.server.domain.UserAuthBase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserAuthBaseRepository extends JpaRepository<UserAuthBase, Long> {
    Optional<UserAuthBase> findByLoginId(String loginId);
    boolean existsByLoginId(String loginId);
}