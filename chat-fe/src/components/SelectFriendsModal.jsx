import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  Checkbox,
  ListItemText,
  TextField,
  AppBar,
  Toolbar
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  height: '70vh',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  display: 'flex',
  flexDirection: 'column'
};

function SelectFriendsModal({ open, onClose, onConfirm, friendsList, initialSelectedFriends = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriends, setSelectedFriends] = useState(initialSelectedFriends);

  useEffect(() => {
    if (open) {
      setSelectedFriends(initialSelectedFriends);
      setSearchTerm('');
    }
  }, [open, initialSelectedFriends]);

  const handleToggle = (friend) => {
    const currentIndex = selectedFriends.findIndex(f => f.userId === friend.userId);
    const newSelected = [...selectedFriends];

    if (currentIndex === -1) {
      newSelected.push(friend);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelectedFriends(newSelected);
  };

  const filteredFriends = friendsList.filter(friend =>
    friend.userNickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              친구 선택
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            label="친구 이름 검색"
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        <List sx={{ flexGrow: 1, overflowY: 'auto', px: 2 }}>
          {filteredFriends.map((friend) => (
            <ListItem key={friend.userId} dense button onClick={() => handleToggle(friend)}>
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
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>취소</Button>
          <Button variant="contained" onClick={() => onConfirm(selectedFriends)}>확인</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default SelectFriendsModal;
