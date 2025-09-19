/**
 * @file CreateRoomModal.jsx
 * @description 이 파일은 새 채팅방을 생성하는 모달을 렌더링하는 CreateRoomModal 컴포넌트를 포함한다.
 * 이 컴포넌트는 ChatListPanel 컴포넌트에서 사용된다.
 * 사용자가 방 이름을 입력하고 새 채팅방에 초대할 친구를 선택할 수 있도록 한다.
 * 
 * @requires react
 * @requires ../api
 * @requires ./InfoModal
 * @requires ./SelectFriendsModal
 * @requires @mui/material
 */

import React, { useState, useEffect } from 'react';

// API 호출 함수
import { createChatRoom, getFriendList } from '../api';

// 공통 모달 컴포넌트
import InfoModal from './InfoModal';
import SelectFriendsModal from './SelectFriendsModal';

// MUI 컴포넌트
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Chip
} from '@mui/material';

// 모달 스타일
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

/**
 * @component CreateRoomModal
 * @description 새 그룹 채팅방을 만드는 모달 컴포넌트
 * @param {object} props - 컴포넌트 props
 * @param {boolean} props.open - 모달 열림/닫힘 상태
 * @param {function} props.onClose - 모달 닫기 핸들러
 * @param {object} props.currentUser - 현재 사용자 정보
 * @param {function} props.onRoomCreated - 채팅방 생성 완료 시 호출되는 콜백 함수
 */
function CreateRoomModal({ open, onClose, currentUser, onRoomCreated }) {
  // 컴포넌트 상태 변수들
  const [roomName, setRoomName] = useState(''); // 채팅방 이름
  const [friends, setFriends] = useState([]); // 친구 목록
  const [selectedFriends, setSelectedFriends] = useState([]); // 선택된 친구 목록
  const [isInfoModalOpen, setInfoModalOpen] = useState(false); // 정보 모달 열림/닫힘 상태
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' }); // 정보 모달 내용
  const [isSelectFriendsModalOpen, setSelectFriendsModalOpen] = useState(false); // 친구 선택 모달 열림/닫힘 상태

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

  // 모달이 열릴 때마다 상태를 초기화하고 친구 목록을 가져옴
  useEffect(() => {
    if (open) {
      setRoomName('');
      setSelectedFriends([]);
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
  }, [open]);

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
   * @function handleCreateRoom
   * @description 채팅방 생성 처리 함수
   */
  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      showInfoModal('입력 오류', '채팅방 이름을 입력해주세요.');
      return;
    }

    if (selectedFriends.length === 0) {
      showInfoModal('입력 오류', '초대할 친구를 1명 이상 선택해주세요.');
      return;
    }

    try {
      const invitedUserNicknames = selectedFriends.map(f => f.userNickname);
      const roomData = {
        roomName,
        // 현재 사용자와 초대된 친구들의 닉네임을 포함
        userNicknames: [currentUser.userNickname, ...invitedUserNicknames],
        roomType: 'GROUP', // 그룹 채팅방으로 설정
      };
      const response = await createChatRoom(roomData);
      showInfoModal('성공', '채팅방이 생성되었습니다.');
      onClose(); // 모달 닫기
      if (onRoomCreated) {
        onRoomCreated(response.data.roomId); // 생성된 채팅방 ID를 부모 컴포넌트로 전달
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
      const errorMessage = error.response?.data?.error || '채팅방 생성에 실패했습니다.';
      showInfoModal('오류', errorMessage);
    }
  };

  // JSX 렌더링
  return (
    <>
      {/* 채팅방 생성 모달 */}
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            새 그룹 채팅방 만들기
          </Typography>
          {/* 채팅방 이름 입력 필드 */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="채팅방 이름"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>초대할 친구</Typography>
          {/* 선택된 친구 목록을 보여주는 영역 */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: '40px', border: '1px solid #ccc', borderRadius: 1, p: 1, mb: 2 }}>
            {selectedFriends.map((friend) => (
              <Chip key={friend.userId} label={friend.userNickname} />
            ))}
          </Box>
          {/* 친구 선택 모달을 여는 버튼 */}
          <Button fullWidth variant="outlined" onClick={() => setSelectFriendsModalOpen(true)}>
            친구 선택
          </Button>
          {/* 채팅방 생성 버튼 */}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleCreateRoom}
          >
            만들기
          </Button>
          {/* 정보 모달 */}
          <InfoModal
            open={isInfoModalOpen}
            onClose={() => setInfoModalOpen(false)}
            title={infoModalContent.title}
            message={infoModalContent.message}
          />
        </Box>
      </Modal>
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

export default CreateRoomModal;