-- chat_message 테이블 생성

CREATE TABLE chat_message
(
  message_id      BIGINT       NOT NULL AUTO_INCREMENT COMMENT '메세지식별번호',
  user_id         BIGINT       NOT NULL COMMENT '유저아이디',
  room_id         BIGINT       NOT NULL COMMENT '채팅방식별번호',
  message_content TEXT         NOT NULL COMMENT '메세지내용',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간',
  PRIMARY KEY (message_id)
) COMMENT '메세지기본';

-- chat_room 테이블 생성

CREATE TABLE chat_room
(
  room_id    BIGINT       NOT NULL AUTO_INCREMENT COMMENT '채팅방식별번호',
  room_name  VARCHAR(100) NULL     COMMENT '채팅방이름', -- VARCHAR 길이 지정
  room_type  VARCHAR(10)  NOT NULL DEFAULT 'ONE' COMMENT '채팅방유형', -- 따옴표 추가
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간', -- CURRENT_TIMESTAMP 로 변경
  updated_at TIMESTAMP    NULL     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '변경시간', -- ON UPDATE 추가 권장
  is_active   VARCHAR(1)   NULL     DEFAULT 'Y' COMMENT '활성화여부', -- VARCHAR 길이 지정
  PRIMARY KEY (room_id)
) COMMENT '채팅방기본';

-- room_participants_history 테이블 생성

CREATE TABLE room_participants_history
(
  participant_id BIGINT    NOT NULL AUTO_INCREMENT COMMENT '참여자식별번호',
  room_id        BIGINT    NOT NULL COMMENT '채팅방식별번호',
  user_id        BIGINT    NOT NULL COMMENT '유저아이디',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간',
  joined_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '채팅방입장시각',
  quit_at        TIMESTAMP NULL     COMMENT '채팅방퇴장시각',
  PRIMARY KEY (participant_id)
) COMMENT '채팅방참여자기본';

-- user_base 테이블 생성

CREATE TABLE user_base
(
  user_id         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '유저아이디',
  user_nickname   VARCHAR(20)  NOT NULL COMMENT '유저닉네임',
  profile_img_url VARCHAR(255) NULL     COMMENT '유저프로필이미지',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간',
  updated_at      TIMESTAMP    NULL     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '변경시간',
  PRIMARY KEY (user_id)
) COMMENT '유저기본';


-- 사용자 인증 정보를 저장하는 테이블
CREATE TABLE user_auth_base
(
    -- 각 인증 정보의 고유 식별자 (자동 증가)
    auth_seq      BIGINT       NOT NULL AUTO_INCREMENT COMMENT '인증정보 식별번호',
    -- 사용자가 로그인 시 사용할 아이디 (중복 불가)
    login_id      VARCHAR(50)  NOT NULL UNIQUE COMMENT '로그인 아이디',
    -- 보안을 위해 해시 처리된 비밀번호
    password      VARCHAR(255) NOT NULL COMMENT '해시된 비밀번호',
    -- 이 인증 정보가 어떤 사용자의 것인지 연결하는 외래 키.
    -- 이 컬럼이 없으면, 로그인 성공 후 어떤 닉네임과 프로필을 가져와야 할지 알 수 없다.
    user_base_id  BIGINT       NOT NULL UNIQUE COMMENT 'user_base 외래 키',
    -- 생성 및 수정 시간
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간',
    updated_at    TIMESTAMP    NULL     DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '변경시간',
    PRIMARY KEY (auth_seq),
    FOREIGN KEY (user_base_id) REFERENCES user_base (user_id) ON DELETE CASCADE
) COMMENT '사용자 인증 기본';



-- 외래 키(FK) 및 인덱스 설정

ALTER TABLE room_participants_history
  ADD CONSTRAINT FK_user_base_TO_room_participants_history
    FOREIGN KEY (user_id)
    REFERENCES user_base (user_id);

ALTER TABLE chat_message
  ADD CONSTRAINT FK_user_base_TO_chat_message
    FOREIGN KEY (user_id)
    REFERENCES user_base (user_id);

ALTER TABLE chat_message
  ADD CONSTRAINT FK_chat_room_TO_chat_message
    FOREIGN KEY (room_id)
    REFERENCES chat_room (room_id);

ALTER TABLE room_participants_history
  ADD CONSTRAINT FK_chat_room_TO_room_participants_history
    FOREIGN KEY (room_id)
    REFERENCES chat_room (room_id);

CREATE INDEX idx_chat_message_room_id
  ON chat_message (room_id ASC);

