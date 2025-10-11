/**
 * @file index.js
 * @description 이 파일은 API 호출을 위한 Axios를 구성하고 사용자 인증, 채팅방 관리 및 친구 관리를 위한 다양한 API 함수를 정의한다.
 * 또한 세션 만료 및 타이머 재설정을 처리하기 위한 Axios 인터셉터를 설정한다.
 * 
 * @requires axios
 */

import axios from 'axios';

// 백엔드 서버와 통신하기 위한 Axios 인스턴스 생성
const apiClient = axios.create({
  // 백엔드 주소 (Spring Boot 서버가 실행 중인 주소)
  baseURL: 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 세션 쿠키를 주고받기 위해 추가
});

/**
 * @function setupInterceptors
 * @description Axios 인터셉터를 설정하는 함수
 * 응답 시 세션 타이머를 재설정하고, 401 에러 발생 시 로그아웃 처리
 * @param {function} logoutHandler - 로그아웃 처리 함수
 * @param {function} resetSessionTimerHandler - 세션 타이머 재설정 함수
 */
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

// --- User API --- //

/**
 * @function signUp
 * @description 회원가입 API 호출
 * @param {object} authData - 로그인 아이디, 비밀번호, 닉네임
 * @returns {Promise} Axios 응답 객체
 */
export const signUp = (authData) => {
  return apiClient.post('/users/signup', authData);
};

/**
 * @function login
 * @description 로그인 API 호출
 * @param {object} authData - 로그인 아이디, 비밀번호
 * @returns {Promise} Axios 응답 객체
 */
export const login = (authData) => {
  return apiClient.post('/users/login', authData);
};

/**
 * @function logout
 * @description 로그아웃 API 호출
 * @returns {Promise} Axios 응답 객체
 */
export const logout = () => {
  return apiClient.post('/users/logout');
};

/**
 * @function checkSession
 * @description 세션 확인 및 내 정보 조회 API 호출
 * @returns {Promise} Axios 응답 객체
 */
export const checkSession = () => {
  return apiClient.get('/users/me');
};

/**
 * @function updateNickname
 * @description 닉네임 변경 API 호출
 * @param {string} nickname - 변경할 닉네임
 * @returns {Promise} Axios 응답 객체
 */
export const updateNickname = (nickname) => {
  return apiClient.put('/users/me/nickname', { nickname });
};

// --- Chat Room API --- //

/**
 * @function getChatRoomsByUserId
 * @description 특정 사용자가 참여한 모든 채팅방 목록 조회 API 호출
 * @param {string} userId - 사용자 ID
 * @returns {Promise} Axios 응답 객체
 */
export const getChatRoomsByUserId = (userId) => {
  return apiClient.get(`/chat/rooms/user/${userId}`);
};

/**
 * @function createChatRoom
 * @description 새 채팅방 생성 API 호출
 * @param {object} roomData - 채팅방 생성 데이터 (방 이름, 참여자 닉네임 목록, 방 타입 등)
 * @returns {Promise} Axios 응답 객체
 */
export const createChatRoom = (roomData) => {
  return apiClient.post('/chat/room', roomData);
};

/**
 * @function getMessagesByRoomId
 * @description 특정 채팅방의 이전 메시지 목록 조회 API 호출
 * @param {string} roomId - 채팅방 ID
 * @returns {Promise} Axios 응답 객체
 */
export const getMessagesByRoomId = (roomId) => {
  return apiClient.get(`/chat/room/${roomId}/messages`);
};

/**
 * @function getRoomInfo
 * @description 특정 채팅방 정보 조회 API 호출
 * @param {string} roomId - 채팅방 ID
 * @returns {Promise} Axios 응답 객체
 */
export const getRoomInfo = (roomId) => {
  return apiClient.get(`/chat/room/${roomId}`);
};

/**
 * @function leaveChatRoom
 * @description 채팅방 나가기 API 호출
 * @param {string} roomId - 나갈 채팅방 ID
 * @returns {Promise} Axios 응답 객체
 */
export const leaveChatRoom = (roomId) => {
  return apiClient.post(`/chat/room/${roomId}/leave`);
};

/**
 * @function inviteUsersToRoom
 * @description 채팅방에 사용자 초대 API 호출
 * @param {string} roomId - 채팅방 ID
 * @param {Array<string>} userNicknames - 초대할 사용자 닉네임 목록
 * @returns {Promise} Axios 응답 객체
 */
export const inviteUsersToRoom = (roomId, userNicknames) => {
  return apiClient.post(`/chat/room/${roomId}/invite`, userNicknames);
};

/**
 * @function getParticipantsHistory
 * @description 채팅방 참여자 입장/퇴장 기록 조회 API 호출
 * @param {string} roomId - 채팅방 ID
 * @returns {Promise} Axios 응답 객체
 */
export const getParticipantsHistory = (roomId) => {
  return apiClient.get(`/chat/room/${roomId}/participants/history`);
};

// --- Friend API --- //

/**
 * @function searchUsers
 * @description 닉네임으로 사용자 검색 API 호출
 * @param {string} nickname - 검색할 닉네임
 * @returns {Promise} Axios 응답 객체
 */
export const searchUsers = (nickname) => {
  return apiClient.get(`/friends/search?nickname=${nickname}`);
};

/**
 * @function sendFriendRequest
 * @description 친구 요청 보내기 API 호출
 * @param {string} recipientId - 요청을 받을 사용자 ID
 * @returns {Promise} Axios 응답 객체
 */
export const sendFriendRequest = (recipientId) => {
  return apiClient.post('/friends/requests', { recipientId });
};

/**
 * @function getPendingFriendRequests
 * @description 보류 중인 친구 요청 목록 조회 API 호출
 * @returns {Promise} Axios 응답 객체
 */
export const getPendingFriendRequests = () => {
  return apiClient.get('/friends/requests/pending');
};

/**
 * @function acceptFriendRequest
 * @description 친구 요청 수락 API 호출
 * @param {string} friendId - 친구 요청 ID
 * @returns {Promise} Axios 응답 객체
 */
export const acceptFriendRequest = (friendId) => {
  return apiClient.post(`/friends/requests/${friendId}/accept`);
};

/**
 * @function rejectFriendRequest
 * @description 친구 요청 거절 API 호출
 * @param {string} friendId - 친구 요청 ID
 * @returns {Promise} Axios 응답 객체
 */
export const rejectFriendRequest = (friendId) => {
  return apiClient.delete(`/friends/requests/${friendId}`);
};

/**
 * @function getFriendList
 * @description 친구 목록 조회 API 호출
 * @returns {Promise} Axios 응답 객체
 */
export const getFriendList = () => {
  return apiClient.get('/friends');
};

/**
 * @function removeFriend
 * @description 친구 삭제 API 호출
 * @param {string} friendId - 삭제할 친구 ID
 * @returns {Promise} Axios 응답 객체
 */
export const removeFriend = (friendId) => {
  return apiClient.delete(`/friends/${friendId}`);
};

export default apiClient;