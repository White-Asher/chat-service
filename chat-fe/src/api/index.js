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

// 인터셉터 설정 함수
export const setupInterceptors = (logoutHandler, resetSessionTimerHandler) => {
  apiClient.interceptors.response.use(
    (response) => {
      // 401 오류가 아니고, 로그인/회원가입/세션확인 요청이 아닌 경우에만 타이머 재설정
      if (
        response.config.url &&
        response.config.url.startsWith('/api/') && // API 요청인 경우에만
        !response.config.url.endsWith('/login') &&
        !response.config.url.endsWith('/signup') &&
        !response.config.url.endsWith('/me')
      ) {
        resetSessionTimerHandler();
      }
      return response; // 성공적인 응답은 그대로 반환
    },
    (error) => {
      // 401 오류이고, 로그인/세션확인 요청이 아닌 경우에만 로그아웃 처리
      if (
        error.response &&
        error.response.status === 401 &&
        !error.config.url.endsWith('/login') &&
        !error.config.url.endsWith('/me')
      ) {
        logoutHandler(true); // 세션 만료로 인한 로그아웃임을 알림
      }
      return Promise.reject(error);
    }
  );
};

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

// 채팅방 나가기 API
export const leaveChatRoom = (roomId) => {
  return apiClient.post(`/chat/room/${roomId}/leave`);
};

// 채팅방에 사용자 초대 API
export const inviteUsersToRoom = (roomId, userNicknames) => {
  return apiClient.post(`/chat/room/${roomId}/invite`, userNicknames);
};

// 채팅방 참여자 입장/퇴장 기록 조회 API
export const getParticipantsHistory = (roomId) => {
  return apiClient.get(`/chat/room/${roomId}/participants/history`);
};

// Friend APIs
export const searchUsers = (nickname) => {
  return apiClient.get(`/friends/search?nickname=${nickname}`);
};

export const sendFriendRequest = (recipientId) => {
  return apiClient.post('/friends/requests', { recipientId });
};

export const getPendingFriendRequests = () => {
  return apiClient.get('/friends/requests/pending');
};

export const acceptFriendRequest = (friendId) => {
  return apiClient.post(`/friends/requests/${friendId}/accept`);
};

export const rejectFriendRequest = (friendId) => {
  return apiClient.delete(`/friends/requests/${friendId}`);
};

export const getFriendList = () => {
  return apiClient.get('/friends');
};

export const removeFriend = (friendId) => {
  return apiClient.delete(`/friends/${friendId}`);
};


export default apiClient;
