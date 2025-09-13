import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getMessagesByRoomId, getRoomInfo } from '../api';
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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';

const drawerWidth = 240;

function ChatRoomPage() {
  const { roomId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

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
          
          if (receivedMessage.type === 'JOIN' || receivedMessage.type === 'LEAVE') {
            if (receivedMessage.participants) {
              setParticipants(receivedMessage.participants);
            }
          }
          // TALK, JOIN, LEAVE 모두 메시지 목록에 추가
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });

        client.publish({
          destination: '/app/chat/message',
          body: JSON.stringify({
            type: 'JOIN',
            roomId: roomId,
            senderId: user.userId,
            senderNickname: user.userNickname,
            message: '',
          }),
        });
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      },
    );

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: '/app/chat/message',
          body: JSON.stringify({
            type: 'LEAVE',
            roomId: roomId,
            senderId: user.userId,
            senderNickname: user.userNickname,
            message: '',
          }),
        });
      }
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
                    {msg.message}
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
    </Box>
  );
}

export default ChatRoomPage;
