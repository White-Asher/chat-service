import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getMessagesByRoomId, getRoomInfo, inviteUsersToRoom, getParticipantsHistory, getFriendList } from '../api';
import { connect, disconnect } from '../services/stompClient';
import {
  Box, TextField, IconButton, List, ListItem, ListItemText, Typography, Paper,
  AppBar, Toolbar, Drawer, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Avatar, Checkbox
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';

const drawerWidth = 240;

const formatTime = (value) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return ''; }
};

function ChatRoomPanel({ roomId }) {
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
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const stompClientRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'auto' });
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

    const stomp = connect(
      (client) => {
        stompClientRef.current = client;
        client.subscribe(`/topic/chat/room/${roomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          if (receivedMessage.type === 'JOIN' || receivedMessage.type === 'LEAVE') {
            if (receivedMessage.participants) setParticipants(receivedMessage.participants);
          }
          setMessages((prev) => [...prev, receivedMessage]);
        });
      },
      (error) => console.error('WebSocket connection error:', error)
    );

    return () => {
      if (stompClientRef.current) {
        disconnect(stompClientRef.current);
        stompClientRef.current = null;
      }
    };
  }, [roomId, user, navigate]);

  useEffect(() => {
    if (inviteModalOpen) {
      const fetchFriends = async () => {
        try {
          const response = await getFriendList();
          setFriends(response.data);
        } catch (error) {
          console.error('Failed to fetch friends:', error);
        }
      };
      fetchFriends();
    }
  }, [inviteModalOpen]);

  const handleFriendToggle = (friend) => {
    const currentIndex = selectedFriends.findIndex(f => f.userId === friend.userId);
    const newSelectedFriends = [...selectedFriends];

    if (currentIndex === -1) {
      newSelectedFriends.push(friend);
    } else {
      newSelectedFriends.splice(currentIndex, 1);
    }

    setSelectedFriends(newSelectedFriends);
    setInviteNicknames(newSelectedFriends.map(f => f.userNickname).join(', '));
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && stompClientRef.current?.connected) {
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

  const handleInviteUsers = async () => {
    if (!inviteNicknames.trim()) return alert('초대할 사용자의 닉네임을 입력해주세요.');
    const nicknames = inviteNicknames.split(',').map(n => n.trim()).filter(Boolean);
    if (nicknames.length === 0) return alert('올바른 닉네임을 입력해주세요.');
    try {
      await inviteUsersToRoom(roomId, nicknames);
      alert('사용자를 초대했습니다.');
      setInviteModalOpen(false);
      setInviteNicknames('');
      setSelectedFriends([]);
    } catch (error) {
      console.error('Failed to invite users:', error);
      alert('사용자 초대에 실패했습니다.');
    }
  };

  const handleViewHistory = async () => {
    try {
      const response = await getParticipantsHistory(roomId);
      setParticipantsHistory(response.data);
      setHistoryModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch participants history:', error);
    }
  };

  const isNotification = (msg) => msg.type === 'JOIN' || msg.type === 'LEAVE';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#36393f' }}>
      <AppBar position="static" sx={{ bgcolor: '#2f3136', boxShadow: 'none', borderBottom: '1px solid #40444b' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}># {roomName || '채팅방'}</Typography>
          <IconButton color="inherit" onClick={() => setInviteModalOpen(true)} title="사용자 초대"><PersonAddIcon /></IconButton>
          <IconButton color="inherit" onClick={handleViewHistory} title="입장/퇴장 기록"><HistoryIcon /></IconButton>
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)}><PeopleIcon /></IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index} sx={{ p: 0, mb: 2, display: 'flex', flexDirection: isNotification(msg) ? 'row' : 'column', alignItems: isNotification(msg) ? 'center' : (msg.senderId === user.userId ? 'flex-end' : 'flex-start') }}>
              {isNotification(msg) ? (
                <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center' }}>
                  {msg.message}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: msg.senderId === user.userId ? 'row-reverse' : 'row' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>{msg.senderNickname?.[0]}</Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexDirection: msg.senderId === user.userId ? 'row-reverse' : 'row' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{msg.senderNickname}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatTime(msg.createdAt)}</Typography>
                    </Box>
                    <Paper sx={{ p: '10px 15px', borderRadius: '10px', bgcolor: msg.senderId === user.userId ? '#7289da' : '#2f3136', color: 'white', mt: 0.5 }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.message}</Typography>
                    </Paper>
                  </Box>
                </Box>
              )}
            </ListItem>
          ))}
          <div ref={messageEndRef} />
        </List>
      </Box>

      <Box sx={{ p: 2, backgroundColor: '#2f3136' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#40444b', borderRadius: '8px', p: '5px 10px' }}>
          <TextField fullWidth variant="standard" InputProps={{ disableUnderline: true }} placeholder={`#${roomName}에 메시지 보내기`} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
          <IconButton color="primary" onClick={handleSendMessage} sx={{ ml: 1 }}><SendIcon /></IconButton>
        </Box>
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { bgcolor: '#2f3136', width: drawerWidth } }}>
        <Box sx={{ p: 2 }}><Typography variant="h6">참여자 ({participants.length}명)</Typography></Box>
        <Divider sx={{ borderColor: '#40444b' }} />
        <List>
          {participants.map((p) => (
            <ListItem key={p.userId}><ListItemText primary={p.userNickname} /></ListItem>
          ))}
        </List>
      </Drawer>
      
      <Dialog open={inviteModalOpen} onClose={() => { setInviteModalOpen(false); setSelectedFriends([]); setInviteNicknames(''); }}>
        <DialogTitle>사용자 초대</DialogTitle>
        <DialogContent>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>친구 목록</Typography>
            <List dense sx={{ width: '100%', maxHeight: 150, overflow: 'auto', bgcolor: 'background.paper' }}>
              {friends.map((friend) => (
                <ListItem key={friend.userId} dense button onClick={() => handleFriendToggle(friend)}>
                  <Checkbox
                    edge="start"
                    checked={selectedFriends.some(f => f.userId === friend.userId)}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText primary={friend.userNickname} />
                </ListItem>
              ))}
            </List>
            <TextField autoFocus margin="dense" label="초대할 사용자 닉네임 (쉼표로 구분)" fullWidth variant="standard" value={inviteNicknames} onChange={(e) => setInviteNicknames(e.target.value)}/>
        </DialogContent>
        <DialogActions><Button onClick={() => { setInviteModalOpen(false); setSelectedFriends([]); setInviteNicknames(''); }}>취소</Button><Button onClick={handleInviteUsers}>초대</Button></DialogActions>
      </Dialog>
      <Dialog open={historyModalOpen} onClose={() => setHistoryModalOpen(false)}><DialogTitle>참여자 기록</DialogTitle><DialogContent><List>{participantsHistory.map((h, i) => (<ListItem key={i}><ListItemText primary={h.userNickname} secondary={`입장: ${h.joinedAt}, 퇴장: ${h.quitAt || '참여중'}`}/></ListItem>))}</List></DialogContent><DialogActions><Button onClick={() => setHistoryModalOpen(false)}>닫기</Button></DialogActions></Dialog>
    </Box>
  );
}

export default ChatRoomPanel;
