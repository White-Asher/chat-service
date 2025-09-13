import axios from 'axios';

// 백엔드 서버와 통신하기 위한 Axios 인스턴스 생성
const apiClient = axios.create({
  // 백엔드 주소 (Spring Boot 서버가 실행 중인 주소)
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 세션 쿠키를 주고받기 위해 추가
});

// 회원가입 API
export const signUp = (authData) => {
  return apiClient.post('/users/signup', authData);
};

// 로그인 API
export const login = (authData) => {
  return apiClient.post('/users/login', authData);
};

// 로그아웃 API
export const logout = () => {
  return apiClient.post('/users/logout');
};

// 세션 확인 및 내 정보 조회 API
export const checkSession = () => {
  return apiClient.get('/users/me');
};

// 특정 사용자가 참여한 모든 채팅방 목록 조회 API
export const getChatRoomsByUserId = (userId) => {
  return apiClient.get(`/chat/rooms/user/${userId}`);
};

// 새 채팅방 생성 API
export const createChatRoom = (roomData) => {
  return apiClient.post('/chat/room', roomData);
};

// 특정 채팅방의 이전 메시지 목록 조회 API
export const getMessagesByRoomId = (roomId) => {
  return apiClient.get(`/chat/room/${roomId}/messages`);
};

// 특정 채팅방 정보 조회 API
export const getRoomInfo = (roomId) => {
  return apiClient.get(`/chat/room/${roomId}`);
};

export default apiClient;
