/**
 * @file stompClient.js
 * @description 이 파일은 STOMP WebSocket 서버에 연결하고 연결을 해제하는 함수를 제공한다.
 * WebSocket 에뮬레이션을 위해 SockJS를 사용하고 STOMP 프로토콜 처리를 위해 @stomp/stompjs를 사용한다.
 * 
 * @requires @stomp/stompjs
 * @requires sockjs-client
 */

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

/**
 * @function connect
 * @description STOMP 클라이언트 연결을 설정하는 함수
 * SockJS를 사용하여 WebSocket 연결을 생성하고, STOMP 클라이언트를 활성화
 * @param {function} onConnected - 연결 성공 시 호출될 콜백 함수
 * @param {function} onError - 연결 또는 STOMP 에러 발생 시 호출될 콜백 함수
 */
export const connect = (onConnected, onError) => {
  // SockJS를 사용하여 WebSocket 연결 생성
  const socket = new SockJS('http://localhost:8080/ws/chat');
  
  // STOMP 클라이언트 인스턴스 생성
  stompClient = new Client({
    webSocketFactory: () => socket, // SockJS 소켓 사용
    debug: (str) => {
      console.log(new Date(), str); // 디버그 로그 출력
    },
    reconnectDelay: 5000, // 5초마다 재연결 시도
    onConnect: () => {
      console.log('STOMP client connected');
      onConnected(stompClient); // 연결 성공 콜백 호출
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      if (onError) onError(); // 에러 콜백 호출
    },
  });

  stompClient.activate(); // STOMP 클라이언트 활성화
};

/**
 * @function disconnect
 * @description STOMP 클라이언트 연결을 해제하는 함수
 */
export const disconnect = () => {
  if (stompClient) {
    stompClient.deactivate(); // STOMP 클라이언트 비활성화
    console.log('STOMP client disconnected');
  }
};