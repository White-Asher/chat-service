import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { env } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // 50명까지 30초간 증가
    { duration: '1m', target: 100 },   // 100명까지 1분간 증가
    { duration: '1m', target: 200 },   // 200명까지 1분간 증가
    { duration: '1m', target: 500 },   // 500명까지 1분간 증가
    { duration: '2m', target: 500 },   // 500명 유지 2분
    { duration: '30s', target: 0 },    // 0명까지 30초간 감소
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'], // 에러율 10% 미만
    http_req_duration: ['p(95)<500'], // 95%가 500ms 미만
    ws_connecting: ['p(95)<1000'], // WebSocket 연결 95%가 1초 미만
  },
};

const WS_URL = env.WS_URL || 'ws://localhost:8081/ws/chat/websocket'; // .env에서 불러오고, 없으면 기본값

export default function () {
  const params = { tags: { my_tag: 'websocket_test' } };
  const res = ws.connect(WS_URL, params, function (socket) {
    let connectSuccess = false;
    
    socket.on('open', function () {
      console.log('WebSocket connection established');
      connectSuccess = true;
      
      // STOMP CONNECT 프레임 전송
      socket.send('CONNECT\naccept-version:1.0,1.1,2.0\n\n\x00');
      
      // 메시지 전송 루프 (더 많은 메시지로 부하 증가)
      for (let i = 0; i < 50; i++) {
        try {
          // STOMP SEND 프레임으로 메시지 전송
          const stompMessage = `SEND\ndestination:/app/chat/message\ncontent-type:application/json\n\n${JSON.stringify({
            type: 'TALK',
            roomId: 1, // 실제 생성된 채팅방 ID
            senderId: 3, // 실제 생성된 사용자 ID
            senderNickname: 'k6user',
            message: `k6 test message ${i}`,
          })}\x00`;
          socket.send(stompMessage);
          sleep(0.1); // 0.1초마다 메시지 전송 (더 빠르게)
        } catch (e) {
          console.error('Message send error:', e);
        }
      }
      
      // 연결 유지 시간 늘리기
      sleep(5);
      socket.close();
    });
    
    socket.on('message', function (data) {
      // 서버로부터 메시지 수신 확인
    });
    
    socket.on('close', function () {
      if (!connectSuccess) {
        console.error('WebSocket connection failed');
      }
    });
    
    socket.on('error', function (e) {
      console.error('WebSocket error: ', e);
    });
  });
  
  check(res, { 
    'status is 101': (r) => r && r.status === 101,
    'connection established': (r) => r !== null
  });
}
