import ws from 'k6/ws';
import { check, sleep } from 'k6';

/*
export const options = {
  stages: [
    { duration: '10s', target: 10 }, // ramp-up to 10 users
    { duration: '30s', target: 50 }, // ramp-up to 50 users
    { duration: '1m', target: 100 }, // ramp-up to 100 users
    { duration: '1m', target: 100 }, // hold at 100 users
    { duration: '30s', target: 0 },  // ramp-down
  ],
};
*/

export const options = {
  stages: [
    { duration: '5s', target: 10 },   // 10명까지 5초간 증가
    { duration: '10s', target: 50 },  // 50명까지 10초간 증가
    { duration: '10s', target: 50 },  // 50명 유지 10초
    { duration: '5s', target: 0 },    // 0명까지 5초간 감소
  ],
};

const WS_URL = 'ws://host.docker.internal:8080/ws/chat/websocket'; // 실제 서버 WebSocket 엔드포인트에 맞게 수정

export default function () {
  const params = { tags: { my_tag: 'websocket_test' } };
  const res = ws.connect(WS_URL, params, function (socket) {
    socket.on('open', function () {
      console.log('WebSocket connection established');
      // 메시지 전송 루프
      for (let i = 0; i < 20; i++) {
        socket.send(JSON.stringify({
          type: 'TALK',
          roomId: '1', // 테스트용 채팅방 ID
          senderId: 'testuser',
          senderNickname: 'k6user',
          message: `k6 test message ${i}`,
        }));
        sleep(0.5); // 0.5초마다 메시지 전송
      }
      socket.close();
    });
    socket.on('message', function (data) {
      // 서버로부터 메시지 수신
      // console.log('Received message: ' + data);
    });
    socket.on('close', function () {
      console.log('WebSocket connection closed');
    });
    socket.on('error', function (e) {
      console.error('WebSocket error: ', e);
    });
  });
  check(res, { 'status is 101': (r) => r && r.status === 101 });
}
