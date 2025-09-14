-- 채팅방 참여자 입장/퇴장 기록 조회를 위한 SQL 스크립트

-- 1. 특정 채팅방의 모든 참여자 입장/퇴장 기록 조회 (최신순)
-- 매개변수: roomId (채팅방 ID)
SELECT 
    rph.participant_id,
    ub.user_nickname,
    rph.joined_at,
    rph.quit_at,
    CASE 
        WHEN rph.quit_at IS NULL THEN '참여 중'
        ELSE '퇴장함'
    END as status
FROM room_participants_history rph
JOIN user_base ub ON rph.user_id = ub.user_id
JOIN chat_room cr ON rph.room_id = cr.room_id
WHERE rph.room_id = ? -- roomId 매개변수
ORDER BY rph.joined_at DESC;

-- 2. 현재 참여 중인 사용자만 조회
-- 매개변수: roomId (채팅방 ID)
SELECT 
    rph.participant_id,
    ub.user_nickname,
    rph.joined_at
FROM room_participants_history rph
JOIN user_base ub ON rph.user_id = ub.user_id
WHERE rph.room_id = ? -- roomId 매개변수
  AND rph.quit_at IS NULL
ORDER BY rph.joined_at ASC;

-- 3. 특정 사용자의 채팅방별 참여 기록 조회
-- 매개변수: userId (사용자 ID)
SELECT 
    cr.room_name,
    rph.joined_at,
    rph.quit_at,
    CASE 
        WHEN rph.quit_at IS NULL THEN '참여 중'
        ELSE '퇴장함'
    END as status,
    CASE 
        WHEN rph.quit_at IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, rph.joined_at, rph.quit_at)
        ELSE TIMESTAMPDIFF(MINUTE, rph.joined_at, NOW())
    END as participation_minutes
FROM room_participants_history rph
JOIN chat_room cr ON rph.room_id = cr.room_id
JOIN user_base ub ON rph.user_id = ub.user_id
WHERE rph.user_id = ? -- userId 매개변수
ORDER BY rph.joined_at DESC;

-- 4. 채팅방별 참여자 통계 (총 참여자 수, 현재 참여자 수)
SELECT 
    cr.room_id,
    cr.room_name,
    COUNT(DISTINCT rph.user_id) as total_participants,
    COUNT(DISTINCT CASE WHEN rph.quit_at IS NULL THEN rph.user_id END) as current_participants,
    MAX(rph.joined_at) as last_join_time
FROM chat_room cr
LEFT JOIN room_participants_history rph ON cr.room_id = rph.room_id
WHERE cr.is_active = 'Y'
GROUP BY cr.room_id, cr.room_name
ORDER BY cr.created_at DESC;

-- 5. 일별 입장/퇴장 통계
-- 매개변수: roomId (채팅방 ID), startDate, endDate
SELECT 
    DATE(rph.joined_at) as join_date,
    COUNT(*) as join_count,
    COUNT(rph.quit_at) as quit_count
FROM room_participants_history rph
WHERE rph.room_id = ? -- roomId 매개변수
  AND DATE(rph.joined_at) BETWEEN ? AND ? -- startDate, endDate 매개변수
GROUP BY DATE(rph.joined_at)
ORDER BY join_date DESC;