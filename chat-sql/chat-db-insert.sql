-- =================================================================
-- 1. 사용자 데이터 생성 (user_base)
-- =================================================================
-- 4명의 가상 사용자를 생성한다.
INSERT INTO user_base (user_id, user_nickname, profile_img_url, created_at, updated_at) VALUES
(1, '라이언', 'http://example.com/profiles/ryan.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '어피치', 'http://example.com/profiles/apeach.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '무지', 'http://example.com/profiles/muzi.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, '콘', 'http://example.com/profiles/con.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- =================================================================
-- 2. 채팅방 데이터 생성 (chat_room)
-- =================================================================
-- 1:1 채팅방 1개와 그룹 채팅방 1개를 생성한다.
-- room_id 101: 1:1 채팅방 (라이언, 어피치)
-- room_id 102: 그룹 채팅방 (카카오프렌즈 단톡방)
INSERT INTO chat_room (room_id, room_name, room_type, created_at, updated_at, is_active) VALUES
(101, NULL, 'ONE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Y'),
(102, '카카오프렌즈 단톡방', 'GROUP', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Y');


-- =================================================================
-- 3. 채팅방 참여자 데이터 생성 (room_participants_history)
-- =================================================================
-- 101번 방(1:1)에 라이언과 어피치를 참여시킨다.
INSERT INTO room_participants_history (participant_id, room_id, user_id, created_at, joined_at, quit_at) VALUES
(1, 101, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
(2, 101, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- 102번 방(그룹)에 라이언, 어피치, 무지를 참여시킨다.
INSERT INTO room_participants_history (participant_id, room_id, user_id, created_at, joined_at, quit_at) VALUES
(3, 102, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
(4, 102, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
(5, 102, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);


-- =================================================================
-- 4. 메시지 데이터 생성 (chat_message)
-- =================================================================
-- 101번 방 (1:1 채팅)의 대화 내용
INSERT INTO chat_message (message_id, user_id, room_id, message_content, created_at) VALUES
(1, 1, 101, '어피치 안녕!', CURRENT_TIMESTAMP - INTERVAL '3' MINUTE),
(2, 2, 101, '안녕 라이언! 무슨 일이야?', CURRENT_TIMESTAMP - INTERVAL '2' MINUTE),
(3, 1, 101, '그냥 인사했어. 오늘 날씨 좋다!', CURRENT_TIMESTAMP - INTERVAL '1' MINUTE);

-- 102번 방 (그룹 채팅)의 대화 내용
INSERT INTO chat_message (message_id, user_id, room_id, message_content, created_at) VALUES
(4, 1, 102, '다들 주말에 뭐해?', CURRENT_TIMESTAMP - INTERVAL '5' MINUTE),
(5, 3, 102, '나는 집에서 쉬려고!', CURRENT_TIMESTAMP - INTERVAL '4' MINUTE),
(6, 2, 102, '나는 영화 보러 갈거야. 같이 갈 사람?', CURRENT_TIMESTAMP - INTERVAL '3' MINUTE),
(7, 1, 102, '오 좋은데? 무슨 영화?', CURRENT_TIMESTAMP - INTERVAL '2' MINUTE);

