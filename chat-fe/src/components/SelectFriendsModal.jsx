/**
 * @file SelectFriendsModal.jsx
 * @description 이 파일은 친구를 선택하는 모달을 렌더링하는 SelectFriendsModal 컴포넌트를 포함한다.
 * 이 컴포넌트는 CreateRoomModal 및 ChatRoomPanel 컴포넌트에서 사용된다.
 * 사용자가 목록에서 친구를 검색하고 선택할 수 있도록 한다.
 * 
 * @requires react
 * @requires @mui/material
 */

import React, { useState, useEffect } from 'react';

// MUI 컴포넌트
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

// 모달 스타일
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

/**
 * @component SelectFriendsModal
 * @description 친구를 선택하는 모달 컴포넌트
 * @param {object} props - 컴포넌트 props
 * @param {boolean} props.open - 모달 열림/닫힘 상태
 * @param {function} props.onClose - 모달 닫기 핸들러
 * @param {function} props.onConfirm - 확인 버튼 클릭 시 호출되는 콜백 함수
 * @param {Array} props.friendsList - 전체 친구 목록
 * @param {Array} props.initialSelectedFriends - 초기에 선택된 친구 목록
 */
function SelectFriendsModal({ open, onClose, onConfirm, friendsList, initialSelectedFriends = [] }) {
  // 컴포넌트 상태 변수들
  const [searchTerm, setSearchTerm] = useState(''); // 검색어
  const [selectedFriends, setSelectedFriends] = useState(initialSelectedFriends); // 선택된 친구 목록

  // 모달이 열릴 때마다 선택된 친구 목록과 검색어를 초기화
  useEffect(() => {
    if (open) {
      setSelectedFriends(initialSelectedFriends);
      setSearchTerm('');
    }
  }, [open, initialSelectedFriends]);

  /**
   * @function handleToggle
   * @description 친구 선택/해제 토글 함수
   * @param {object} friend - 선택/해제할 친구 객체
   */
  const handleToggle = (friend) => {
    const currentIndex = selectedFriends.findIndex(f => f.userId === friend.userId);
    const newSelected = [...selectedFriends];

    if (currentIndex === -1) {
      // 선택되지 않은 경우, 선택 목록에 추가
      newSelected.push(friend);
    } else {
      // 이미 선택된 경우, 선택 목록에서 제거
      newSelected.splice(currentIndex, 1);
    }
    setSelectedFriends(newSelected);
  };

  // 검색어에 따라 필터링된 친구 목록
  const filteredFriends = friendsList.filter(friend =>
    friend.userNickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // JSX 렌더링
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* 모달 헤더 */}
        <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              친구 선택
            </Typography>
          </Toolbar>
        </AppBar>
        {/* 친구 검색 입력 필드 */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            label="친구 이름 검색"
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        {/* 친구 목록 */}
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
        {/* 하단 버튼 (취소, 확인) */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>취소</Button>
          <Button variant="contained" onClick={() => onConfirm(selectedFriends)}>확인</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default SelectFriendsModal;