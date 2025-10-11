// 로그인 후 세션 쿠키 반환
async function login(loginId, password) {
  const res = await api.post('/users/login', { loginId, password });
  console.log('Login success:', res.data);
  // 쿠키 추출 (Node.js 환경에서 set-cookie 헤더)
  const cookies = res.headers['set-cookie'];
  return cookies ? cookies.join('; ') : '';
}
// Node.js 스크립트: 사전 테스트 데이터 생성
// 실행: node setupData.js

const axios = require('axios');

const api = axios.create({
  baseURL: 'http://172.30.1.55:8081/api', // 실제 서버 주소와 포트로 변경
  headers: { 'Content-Type': 'application/json' }
});

async function createUser(userId, nickname, password) {
  const res = await api.post('/users/signup', {
    loginId: userId,      // 4~12자, 영문+숫자
    nickname: nickname,   // 2~10자
    password: password    // 6~15자
  });
  console.log('User created:', res.data);
  return res.data;
}

async function createRoom(roomName, roomType, userNicknames) {
  const res = await api.post('/chat/room', {
    roomName,
    roomType,
    userNicknames
  });
  console.log('Room created:', res.data);
  return res.data;
}

async function main() {
  // 랜덤값 생성 함수
  function randomStr(len) {
    return Math.random().toString(36).replace(/[^a-z0-9]/g, '').substring(0, len);
  }

  // 1. 유저 생성 (중복 방지, 조건 맞춤)
  const loginId = 'tu' + randomStr(6); // 8자, 영문+숫자
  const nickname = '테' + randomStr(4); // 5자, 한글+영문/숫자
  const password = randomStr(8) + '1A'; // 10자, 영문+숫자
  const user = await createUser(loginId, nickname, password);

  // 2. 로그인 후 세션 쿠키 적용
  const cookies = await login(loginId, password);
  api.defaults.headers.Cookie = cookies;

  // 3. 채팅방 생성 (참여자 닉네임 배열)
  const room = await createRoom('테스트방', 'GROUP', [nickname]);

  // 4. 결과 출력
  console.log('loginId:', loginId);
  console.log('nickname:', nickname);
  console.log('userId:', user.userId);
  console.log('roomId:', room.roomId);
}

main().catch(console.error);
