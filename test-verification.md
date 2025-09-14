# 채팅방 입장/퇴장 로직 변경 검증

## 구현된 기능 요약

### 백엔드 구현
1. **새로운 입장 처리**:
   - `ChatService.createChatRoom()`: 채팅방 생성 시 초대받은 사용자들 자동 입장 (joinedAt 기록)
   - `ChatService.inviteUsersToRoom()`: 기존 채팅방에 사용자 초대 시 입장 기록
   - `ChatController.inviteUsersToRoom()`: 초대 API 엔드포인트

2. **기존 퇴장 처리 유지**:
   - `ChatController.leaveChatRoom()`: 채팅방 목록에서 나가기 버튼 클릭 시 퇴장 (quitAt 기록)

3. **웹소켓 이벤트 변경**:
   - `MessageController`: JOIN/LEAVE 이벤트는 실제 입장/퇴장 처리하지 않고 알림용으로만 사용

4. **기록 조회 기능**:
   - `ChatController.getParticipantsHistory()`: 채팅방별 입장/퇴장 기록 조회
   - `ChatRoomDto.ParticipantHistory`: 기록 DTO 클래스

### 프론트엔드 구현
1. **ChatRoomPage 수정**:
   - 채팅방 접속/나가기 시 JOIN/LEAVE 웹소켓 이벤트 제거
   - 사용자 초대 기능 추가 (PersonAdd 버튼, 초대 모달)
   - 입장/퇴장 기록 조회 기능 추가 (History 버튼, 기록 모달)

2. **ChatListPage 유지**:
   - 나가기 버튼을 통한 실제 퇴장 처리는 기존 그대로 유지

## 요구사항 대비 검증

### ✅ 구현된 요구사항
1. **입장 기준 변경**: 
   - 채팅방 생성 시 초대받은 사용자들 → 입장 처리 ✅
   - 기존 채팅방에 다른 사용자 초대 시 → 입장 처리 ✅

2. **퇴장 기준 변경**:
   - 채팅방 목록에서 나가기 버튼 클릭 시 → 퇴장 처리 ✅
   - 채팅방 페이지 나가기는 퇴장이 아님 ✅

3. **시간 기록 및 조회**:
   - DB에 입장/퇴장 시간 기록 ✅
   - 나중에 조회할 수 있는 기능 ✅

4. **DB 변경 없이 구현**:
   - 기존 room_participants_history 테이블 활용 ✅

## 테스트 시나리오
1. 채팅방 생성 → 초대받은 사용자들의 입장 기록 확인
2. 기존 채팅방에서 사용자 초대 → 새 사용자의 입장 기록 확인  
3. 채팅방 목록에서 나가기 → 퇴장 기록 확인
4. 채팅방 페이지 접속/나가기 → 실제 입장/퇴장 처리되지 않음 확인
5. 기록 조회 → 모든 입장/퇴장 기록 정확히 표시 확인