package com.chat.server.repository;

import com.chat.server.domain.UserAuthBase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * 사용자 인증 정보 엔티티에 대한 데이터 접근을 담당하는 Repository 인터페이스다.
 * 로그인 ID 기반 인증 정보의 조회, 저장, 수정, 삭제와 관련된 데이터베이스 작업을 처리한다.
 */
public interface UserAuthBaseRepository extends JpaRepository<UserAuthBase, Long> {
    
    /**
     * 로그인 ID로 사용자 인증 정보를 조회한다.
     * 로그인 인증 시 해당 ID가 존재하는지 확인할 때 사용한다.
     * @param loginId 조회할 로그인 ID
     * @return 해당 로그인 ID의 인증 정보 (있을 경우)
     */
    Optional<UserAuthBase> findByLoginId(String loginId);
    
    /**
     * 특정 로그인 ID가 이미 존재하는지 확인한다.
     * 회원가입 시 중복 ID 검사에 사용한다.
     * @param loginId 확인할 로그인 ID
     * @return 존재하면 true, 없으면 false
     */
    boolean existsByLoginId(String loginId);
}