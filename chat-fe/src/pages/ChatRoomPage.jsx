import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getMessagesByRoomId, getRoomInfo, inviteUsersToRoom, getParticipantsHistory } from '../api';
import { connect, disconnect } from '../services/stompClient';
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Drawer,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';

const drawerWidth = 240;

// 시간 포맷터
const formatTime = (value) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  } catch {
    return '';
  }
};

function ChatRoomPage() {
  const { roomId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteNicknames, setInviteNicknames] = useState('');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [participantsHistory, setParticipantsHistory] = useState([]);

  const stompClientRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    connect(
      (client) => {
        stompClientRef.current = client;
        client.subscribe(`/topic/chat/room/${roomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);

          // JOIN, LEAVE 타입일 경우 참여자 목록 업데이트
          if (receivedMessage.type === 'JOIN' || receivedMessage.type === 'LEAVE') {
            if (receivedMessage.participants) {
              setParticipants(receivedMessage.participants);
            }
          }
          // 모든 타입의 메시지를 메시지 목록에 추가
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      },
    );

    return () => {
      disconnect();
    };
  }, [roomId, user, navigate]);

  const handleSendMessage = () => {
    if (newMessage.trim() && stompClientRef.current) {
      const chatMessage = {
        type: 'TALK',
        roomId: roomId,
        senderId: user.userId,
        senderNickname: user.userNickname,
        message: newMessage,
      };

      stompClientRef.current.publish({
        destination: '/app/chat/message',
        body: JSON.stringify(chatMessage),
      });

      setNewMessage('');
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleInviteUsers = async () => {
    if (!inviteNicknames.trim()) {
      alert('초대할 사용자의 닉네임을 입력해주세요.');
      return;
    }

    const nicknames = inviteNicknames.split(',').map(nickname => nickname.trim()).filter(nickname => nickname);

    if (nicknames.length === 0) {
      alert('올바른 닉네임을 입력해주세요.');
      return;
    }

    try {
      await inviteUsersToRoom(roomId, nicknames);
      alert(`${nicknames.join(', ')} 사용자를 초대했습니다.`);
      setInviteModalOpen(false);
      setInviteNicknames('');
      // 참여자 목록은 WebSocket을 통해 자동으로 갱신됩니다.
    } catch (error) {
      console.error('Failed to invite users:', error);
      alert('사용자 초대에 실패했습니다. 존재하지 않는 닉네임이 포함되어 있을 수 있습니다.');
    }
  };

  const handleViewHistory = async () => {
    try {
      const response = await getParticipantsHistory(roomId);
      setParticipantsHistory(response.data);
      setHistoryModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch participants history:', error);
      alert('참여자 기록 조회에 실패했습니다.');
    }
  };

  const isNotification = (msg) => msg.type === 'JOIN' || msg.type === 'LEAVE';

  return (
    <Box sx={{ height: '90vh', display: 'flex' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate('/chat')} aria-label="back">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
              {roomName || '채팅방'}
            </Typography>
            <IconButton color="inherit" onClick={() => setInviteModalOpen(true)} title="사용자 초대">
              <PersonAddIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleViewHistory} title="입장/퇴장 기록">
              <HistoryIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleDrawerToggle}>
              <PeopleIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Paper sx={{ flexGrow: 1, overflow: 'auto', p: 2, backgroundColor: '#f5f5f5' }}>
          <List>
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  justifyContent: isNotification(msg)
                    ? 'center'
                    : msg.senderId === user.userId ? 'flex-end' : 'flex-start',
                }}
              >
                {isNotification(msg) ? (
                  <Typography variant="body2" color="text.secondary">
                    {/* 서버에서 받은 메시지를 그대로 표시 */}
                    {`${formatTime(msg.createdAt)} • ${msg.message}`}
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      bgcolor: msg.senderId === user.userId ? 'primary.main' : 'grey.300',
                      color: msg.senderId === user.userId ? 'primary.contrastText' : 'text.primary',
                      p: 1.5,
                      borderRadius: 2,
                      maxWidth: '70%',
                    }}
                  >
                    <Typography variant="caption" display="block">{msg.senderNickname}</Typography>
                    <ListItemText primary={msg.message} />
                    {msg.createdAt && (
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7, mt: 0.5 }}>
                        {formatTime(msg.createdAt)}
                      </Typography>
                    )}
                  </Box>
                )}
              </ListItem>
            ))}
            <div ref={messageEndRef} />
          </List>
        </Paper>

        <Box sx={{ p: 2, backgroundColor: 'background.default', display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <IconButton color="primary" onClick={handleSendMessage} sx={{ ml: 1 }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">참여자 목록 ({participants.length}명)</Typography>
        </Box>
        <Divider />
        <List>
          {participants.map((p) => (
            <ListItem key={p.userId}>
              <ListItemText primary={p.userNickname} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* 사용자 초대 모달 */}
      <Dialog open={inviteModalOpen} onClose={() => setInviteModalOpen(false)}>
        <DialogTitle>사용자 초대</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="초대할 사용자 닉네임 (쉼표로 구분)"
            placeholder="예: user2, user3"
            fullWidth
            variant="outlined"
            value={inviteNicknames}
            onChange={(e) => setInviteNicknames(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteModalOpen(false)}>취소</Button>
          <Button onClick={handleInviteUsers} variant="contained">초대</Button>
        </DialogActions>
      </Dialog>

      {/* 참여자 기록 모달 */}
      <Dialog open={historyModalOpen} onClose={() => setHistoryModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>참여자 입장/퇴장 기록</DialogTitle>
        <DialogContent>
          <List>
            {participantsHistory.map((history, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${history.userNickname}님`}
                  secondary={
                    <div>
                      <div>입장: {formatTime(history.joinedAt)}</div>
                      {history.quitAt && <div>퇴장: {formatTime(history.quitAt)}</div>}
                      {!history.quitAt && <div style={{ color: 'green' }}>현재 참여 중</div>}
                    </div>
                  }
                />
              </ListItem>
            ))}
            {participantsHistory.length === 0 && (
              <Typography sx={{ textAlign: 'center', mt: 2 }}>
                기록이 없습니다.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryModalOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ChatRoomPage;