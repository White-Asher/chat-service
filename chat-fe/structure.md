```
chat-fe/
├── src/
│   ├── api/
│   │   └── index.js         # 서버와 통신하는 Axios API 클라이언트
│   ├── components/
│   │   └── CreateRoomModal.jsx # 새 채팅방을 만드는 MUI 모달 컴포넌트
│   ├── context/
│   │   └── UserContext.jsx    # 로그인한 사용자 정보를 전역으로 관리하는 Context
│   ├── pages/
│   │   ├── LoginPage.jsx      # 닉네임으로 로그인하는 페이지
│   │   ├── ChatListPage.jsx   # 채팅방 목록을 보여주는 메인 페이지
│   │   └── ChatRoomPage.jsx   # 실시간으로 대화하는 채팅방 페이지
│   ├── services/
│   │   └── stompClient.js     # WebSocket(STOMP) 연결 및 통신을 관리하는 로직
│   ├── App.jsx                # 전체 라우팅 및 레이아웃을 담당하는 메인 컴포넌트
│   └── main.jsx               # React 앱의 진입점
└── index.html                 # public HTML 파일
```