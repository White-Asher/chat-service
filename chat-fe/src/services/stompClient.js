import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

// STOMP 클라이언트 연결 함수
export const connect = (onConnected, onError) => {
  // SockJS를 사용하여 WebSocket 연결 생성
  const socket = new SockJS('http://localhost:8080/ws/chat');
  
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => {
      console.log(new Date(), str);
    },
    reconnectDelay: 5000, // 5초마다 재연결 시도
    onConnect: () => {
      console.log('STOMP client connected');
      onConnected(stompClient);
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      if (onError) onError();
    },
  });

  stompClient.activate();
};

// STOMP 클라이언트 연결 해제 함수
export const disconnect = () => {
  if (stompClient) {
    stompClient.deactivate();
    console.log('STOMP client disconnected');
  }
};
