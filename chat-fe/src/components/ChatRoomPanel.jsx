/**
 * @file ChatRoomPanel.jsx
 * @description 이 파일은 채팅방 인터페이스를 렌더링하는 ChatRoomPanel 컴포넌트를 포함한다.
 * 이 컴포넌트는 MainChatPage 컴포넌트에서 사용된다.
 * 채팅 메시지, 참여자를 표시하고 메시지 전송, 사용자 초대, 채팅 기록 보기 기능을 제공한다.
 *
 * @requires react
 * @requires react-router-dom
 * @requires ../context/UserContext
 * @requires ../api
 * @requires ../services/stompClient
 * @requires ./InfoModal
 * @requires ./SelectFriendsModal
 * @requires @mui/material
 * @requires @mui/icons-material/Send
 * @requires @mui/icons-material/People
 * @requires @mui/icons-material/PersonAdd
 * @requires @mui/icons-material/History
 * 
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 사용자 정보 컨텍스트
import { useUser } from '../context/UserContext';

// API 호출 함수
import { getMessagesByRoomId, getRoomInfo, inviteUsersToRoom, getParticipantsHistory, getFriendList } from '../api';

// Stomp 클라이언트 연결 및 해제 함수
import { connect, disconnect } from '../services/stompClient';

// 공통 모달 컴포넌트
import InfoModal from './InfoModal';
import SelectFriendsModal from './SelectFriendsModal';

// MUI 컴포넌트
import {
  Box, TextField, IconButton, List, ListItem, ListItemText, Typography, Paper,
  AppBar, Toolbar, Drawer, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Avatar, Chip
} from '@mui/material';

// MUI 아이콘
import SendIcon from '@mui/icons-material/Send';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';

// 오른쪽 참여자 목록 Drawer의 너비
const drawerWidth = 240;

/**
 * @function formatDateTime
 * @description 날짜 및 시간 문자열을 포맷하는 함수
 * 오늘 날짜이면 시간만 표시하고, 이전 날짜이면 날짜와 시간을 함께 표시
 * @param {string} value - 날짜 및 시간 문자열
 * @returns {string} 포맷된 날짜 및 시간 문자열
 */
const formatDateTime = (value) => {
  if (!value) return '';
  try {
    const messageDate = new Date(value);
    if (isNaN(messageDate.getTime())) return '';

    const today = new Date();
    const isToday = today.getFullYear() === messageDate.getFullYear() &&
                    today.getMonth() === messageDate.getMonth() &&
                    today.getDate() === messageDate.getDate();

    if (isToday) {
      return messageDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      return messageDate.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  } catch { return ''; }
};

/**
 * @component ChatRoomPanel
 * @description 채팅방 전체 UI를 구성하고 관련 로직을 처리하는 컴포넌트
 * @param {object} props - 컴포넌트 props
 * @param {string} props.roomId - 현재 채팅방 ID
 */
function ChatRoomPanel({ roomId }) {
  // 사용자 정보 및 라우터 네비게이션
  const { user } = useUser();
  const navigate = useNavigate();

  // 컴포넌트 상태 변수들
  const [messages, setMessages] = useState([]); // 채팅 메시지 목록
  const [newMessage, setNewMessage] = useState(''); // 새로 입력하는 메시지
  const [participants, setParticipants] = useState([]); // 현재 참여자 목록
  const [roomName, setRoomName] = useState(''); // 채팅방 이름
  const [drawerOpen, setDrawerOpen] = useState(false); // 참여자 목록 Drawer 열림/닫힘 상태
  const [inviteModalOpen, setInviteModalOpen] = useState(false); // 사용자 초대 모달 열림/닫힘 상태
  const [historyModalOpen, setHistoryModalOpen] = useState(false); // 참여 기록 모달 열림/닫힘 상태
  const [participantsHistory, setParticipantsHistory] = useState([]); // 참여 기록 데이터
  const [friends, setFriends] = useState([]); // 친구 목록
  const [selectedFriends, setSelectedFriends] = useState([]); // 초대를 위해 선택된 친구 목록
  const [isInfoModalOpen, setInfoModalOpen] = useState(false); // 정보 모달 열림/닫힘 상태
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' }); // 정보 모달 내용
  const [isSelectFriendsModalOpen, setSelectFriendsModalOpen] = useState(false); // 친구 선택 모달 열림/닫힘 상태

  // Stomp 클라이언트와 메시지 목록 끝을 참조하기 위한 ref
  const stompClientRef = useRef(null);
  const messageEndRef = useRef(null);

  /**
   * @function showInfoModal
   * @description 정보 모달을 표시하는 함수
   * @param {string} title - 모달 제목
   * @param {string} message - 모달 내용
   */
  const showInfoModal = (title, message) => {
    setInfoModalContent({ title, message });
    setInfoModalOpen(true);
  };

  // 새 메시지가 추가될 때마다 메시지 목록의 가장 아래로 스크롤
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // roomId가 변경될 때마다 실행되는 useEffect
  // 채팅방 데이터(메시지, 참여자)를 가져오고 웹소켓 연결을 설정
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const [messagesResponse, roomInfoResponse] = await Promise.all([
          getMessagesByRoomId(roomId),
          getRoomInfo(roomId),
        ]);
        setMessages(messagesResponse.data);
        setRoomName(roomInfoResponse.data.roomName);
        setParticipants(roomInfoResponse.data.participants);
      } catch (error) {
        console.error('Failed to fetch room data:', error);
        navigate('/chat');
      }
    };

    fetchRoomData();

    // 웹소켓 연결 설정
    connect(
      (client) => {
        stompClientRef.current = client;
        // 해당 채팅방 주제를 구독하여 실시간 메시지를 받음
        client.subscribe(`/topic/chat/room/${roomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          // 입장/퇴장 메시지인 경우 참여자 목록 업데이트
          if (receivedMessage.type === 'JOIN' || receivedMessage.type === 'LEAVE') {
            if (receivedMessage.participants) setParticipants(receivedMessage.participants);
          }
          setMessages((prev) => [...prev, receivedMessage]);
        });
      },
      (error) => console.error('WebSocket connection error:', error)
    );

    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    return () => {
      if (stompClientRef.current) {
        disconnect(stompClientRef.current);
        stompClientRef.current = null;
      }
    };
  }, [roomId, user, navigate]);

  // 초대 모달이 열릴 때 친구 목록을 가져옴
  useEffect(() => {
    if (inviteModalOpen) {
      const fetchFriends = async () => {
        try {
          // 이미 채팅방에 참여중인 친구는 제외하고 목록을 가져옴
          const response = await getFriendList();
          const participantIds = participants.map(p => p.userId);
          const availableFriends = response.data.filter(friend => !participantIds.includes(friend.userId));
          setFriends(availableFriends);
        } catch (error) {
          console.error('Failed to fetch friends:', error);
        }
      };
      fetchFriends();
    }
  }, [inviteModalOpen, participants]);

  /**
   * @function handleSelectFriendsConfirm
   * @description 친구 선택 모달에서 확인 버튼을 눌렀을 때 호출되는 함수
   * @param {Array} newSelectedFriends - 선택된 친구 목록
   */
  const handleSelectFriendsConfirm = (newSelectedFriends) => {
    setSelectedFriends(newSelectedFriends);
    setSelectFriendsModalOpen(false);
  };

  /**
   * @function handleSendMessage
   * @description 메시지 전송 처리 함수
   */
  const handleSendMessage = () => {
    console.log('handleSendMessage called', {
      newMessage,
      stompClient: stompClientRef.current,
      connected: stompClientRef.current?.connected
    });
    if (newMessage.trim() && stompClientRef.current && stompClientRef.current.connected) {
      const chatMessage = {
        type: 'TALK', roomId, senderId: user.userId,
        senderNickname: user.userNickname, message: newMessage,
      };
      stompClientRef.current.publish({
        destination: '/app/chat/message',
        body: JSON.stringify(chatMessage),
      });
      setNewMessage('');
    }
  };

  /**
   * @function handleInviteUsers
   * @description 선택된 친구들을 채팅방에 초대하는 함수
   */
  const handleInviteUsers = async () => {
    if (selectedFriends.length === 0) {
      showInfoModal('입력 오류', '초대할 친구를 선택해주세요.');
      return;
    }
    const nicknames = selectedFriends.map(f => f.userNickname);
    try {
      await inviteUsersToRoom(roomId, nicknames);
      showInfoModal('성공', '사용자를 초대했습니다.');
      setInviteModalOpen(false);
      setSelectedFriends([]);
    } catch (error) {
      console.error('Failed to invite users:', error);
      showInfoModal('오류', error.response?.data?.message || '사용자 초대에 실패했습니다.');
    }
  };

  /**
   * @function handleViewHistory
   * @description 채팅방 참여/퇴장 기록을 보는 함수
   */
  const handleViewHistory = async () => {
    try {
      const response = await getParticipantsHistory(roomId);
      setParticipantsHistory(response.data);
      setHistoryModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch participants history:', error);
    }
  };

  /**
   * @function isNotification
   * @description 메시지가 알림(입장/퇴장) 메시지인지 확인하는 함수
   * @param {object} msg - 메시지 객체
   * @returns {boolean} 알림 메시지 여부
   */
  const isNotification = (msg) => msg.type === 'JOIN' || msg.type === 'LEAVE';

  // JSX 렌더링
  return (
    <>
      {/* 전체 채팅방 패널 레이아웃 */}
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#36393f' }}>
        {/* 상단 앱 바 (채팅방 이름, 버튼 등) */}
        <AppBar position="static" sx={{ bgcolor: '#2f3136', boxShadow: 'none', borderBottom: '1px solid #40444b' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}># {roomName || '채팅방'}</Typography>
            <IconButton color="inherit" onClick={() => setInviteModalOpen(true)} title="사용자 초대"><PersonAddIcon /></IconButton>
            <IconButton color="inherit" onClick={handleViewHistory} title="입장/퇴장 기록"><HistoryIcon /></IconButton>
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}><PeopleIcon /></IconButton>
          </Toolbar>
        </AppBar>

        {/* 메시지 목록 */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index} sx={{ p: 0, mb: 2, display: 'flex', flexDirection: isNotification(msg) ? 'row' : 'column', alignItems: isNotification(msg) ? 'center' : (msg.senderId === user.userId ? 'flex-end' : 'flex-start') }}>
                {isNotification(msg) ? (
                  // 알림 메시지 (입장/퇴장)
                  <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center' }}>
                    {msg.message}
                  </Typography>
                ) : (
                  // 일반 채팅 메시지
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: msg.senderId === user.userId ? 'row-reverse' : 'row' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>{msg.senderNickname?.[0]}</Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexDirection: msg.senderId === user.userId ? 'row-reverse' : 'row' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{msg.senderNickname}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatDateTime(msg.createdAt)}</Typography>
                      </Box>
                      <Paper sx={{ p: '10px 15px', borderRadius: '10px', bgcolor: msg.senderId === user.userId ? '#7289da' : '#2f3136', color: 'white', mt: 0.5 }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.message}</Typography>
                      </Paper>
                    </Box>
                  </Box>
                )}
              </ListItem>
            ))}
            {/* 스크롤을 맨 아래로 이동시키기 위한 빈 div */}
            <div ref={messageEndRef} />
          </List>
        </Box>

        {/* 메시지 입력 창 */}
        <Box sx={{ p: 2, backgroundColor: '#2f3136' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#40444b', borderRadius: '8px', p: '5px 10px' }}>
            <TextField fullWidth variant="standard" InputProps={{ disableUnderline: true }} placeholder={`#${roomName}에 메시지 보내기`} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
            <IconButton color="primary" onClick={handleSendMessage} sx={{ ml: 1 }}><SendIcon /></IconButton>
          </Box>
        </Box>

        {/* 오른쪽 참여자 목록 Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { bgcolor: '#2f3136', width: drawerWidth } }}>
          <Box sx={{ p: 2 }}><Typography variant="h6">참여자 ({participants.length}명)</Typography></Box>
          <Divider sx={{ borderColor: '#40444b' }} />
          <List>
            {participants.map((p) => (
              <ListItem key={p.userId}><ListItemText primary={p.userNickname} /></ListItem>
            ))}
          </List>
        </Drawer>
        
        {/* 사용자 초대 모달 */}
        <Dialog open={inviteModalOpen} onClose={() => { setInviteModalOpen(false); setSelectedFriends([]); }}>
          <DialogTitle>사용자 초대</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>초대할 친구</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: '40px', border: '1px solid #ccc', borderRadius: 1, p: 1, mb: 2 }}>
              {selectedFriends.map((friend) => (
                <Chip key={friend.userId} label={friend.userNickname} />
              ))}
            </Box>
            <Button fullWidth variant="outlined" onClick={() => setSelectFriendsModalOpen(true)}>
              친구 선택
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setInviteModalOpen(false); setSelectedFriends([]); }}>취소</Button>
            <Button onClick={handleInviteUsers}>초대</Button>
          </DialogActions>
        </Dialog>

        {/* 참여 기록 모달 */}
        <Dialog open={historyModalOpen} onClose={() => setHistoryModalOpen(false)}>
          <DialogTitle>참여자 기록</DialogTitle>
          <DialogContent>
            <List>
              {participantsHistory.map((h, i) => (
                <ListItem key={i}>
                  <ListItemText primary={h.userNickname} secondary={`입장: ${h.joinedAt}, 퇴장: ${h.quitAt || '참여중'}`}/>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoryModalOpen(false)}>닫기</Button>
          </DialogActions>
        </Dialog>

        {/* 정보 모달 */}
        <InfoModal
          open={isInfoModalOpen}
          onClose={() => setInfoModalOpen(false)}
          title={infoModalContent.title}
          message={infoModalContent.message}
        />
      </Box>

      {/* 친구 선택 모달 */}
      <SelectFriendsModal
        open={isSelectFriendsModalOpen}
        onClose={() => setSelectFriendsModalOpen(false)}
        onConfirm={handleSelectFriendsConfirm}
        friendsList={friends}
        initialSelectedFriends={selectedFriends}
      />
    </>
  );
}

export default ChatRoomPanel;
