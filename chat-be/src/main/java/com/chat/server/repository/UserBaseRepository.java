package com.chat.server.repository;

import com.chat.server.domain.UserBase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 기본 정보 엔티티에 대한 데이터 접근을 담당하는 Repository 인터페이스다.
 * 사용자 프로필 정보의 저장, 조회, 수정, 삭제와 닉네임 기반 검색 등의 데이터베이스 작업을 처리한다.
 */
public interface UserBaseRepository extends JpaRepository<UserBase, Long> {

    /**
     * 닉네임으로 사용자가 존재하는지 확인한다.
     * Spring Data JPA의 쿼리 메소드 기능에 의해 자동으로 쿼리가 생성된다.
     * @param userNickname 확인할 닉네임
     * @return 존재하면 true, 아니면 false
     */
    boolean existsByUserNickname(String userNickname);

    /**
     * 닉네임으로 사용자 정보를 조회한다. (선택적)
     * @param nickname 조회할 닉네임
     * @return Optional<UserBase>
     */
    Optional<UserBase> findByUserNickname(String nickname);

    /**
     * 닉네임에 특정 문자열을 포함하고, 자신의 아이디는 제외한 사용자 목록을 조회한다.
     * @param nickname 검색할 닉네임 문자열
     * @param userId 제외할 사용자 ID
     * @return List<UserBase>
     */
    List<UserBase> findByUserNicknameContainingAndUserIdNot(String nickname, Long userId);
}
