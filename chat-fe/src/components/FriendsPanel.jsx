/**
 * @file FriendsPanel.jsx
 * @description 이 파일은 친구 패널을 렌더링하는 FriendsPanel 컴포넌트를 포함한다.
 * 이 컴포넌트는 MainChatPage 컴포넌트에서 사용된다.
 * 사용자의 친구 목록, 보류 중인 친구 요청을 표시하고 새 친구를 추가할 수 있도록 한다.
 * 
 * @requires react
 * @requires ../context/UserContext
 * @requires ../api
 * @requires ./InfoModal
 * @requires ./ConfirmModal
 * @requires @mui/material
 * @requires @mui/icons-material/Add
 * @requires @mui/icons-material/Check
 * @requires @mui/icons-material/Clear
 * @requires @mui/icons-material/Delete
 */

import React, { useState, useEffect } from 'react';

// 사용자 정보 컨텍스트
import { useUser } from '../context/UserContext';

// API 호출 함수
import { getFriendList, getPendingFriendRequests, searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from '../api';

// 공통 모달 컴포넌트
import InfoModal from './InfoModal';
import ConfirmModal from './ConfirmModal';

// MUI 컴포넌트
import { Box, Typography, Tabs, Tab, List, ListItem, ListItemText, Button, TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * @component FriendsPanel
 * @description 친구 목록, 보류 중인 요청, 친구 추가 기능을 관리하는 패널 컴포넌트
 */
function FriendsPanel() {
    // 사용자 정보 컨텍스트
    const { user } = useUser();

    // 컴포넌트 상태 변수들
    const [tab, setTab] = useState(0); // 현재 선택된 탭 (0: 친구, 1: 보류중, 2: 친구추가)
    const [friends, setFriends] = useState([]); // 친구 목록
    const [pendingRequests, setPendingRequests] = useState([]); // 보류 중인 친구 요청 목록
    const [searchQuery, setSearchQuery] = useState(''); // 사용자 검색어
    const [searchResults, setSearchResults] = useState([]); // 사용자 검색 결과
    const [isInfoModalOpen, setInfoModalOpen] = useState(false); // 정보 모달 열림/닫힘 상태
    const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' }); // 정보 모달 내용
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false); // 확인 모달 열림/닫힘 상태
    const [confirmModalContent, setConfirmModalContent] = useState({ title: '', message: '', onConfirm: () => {} }); // 확인 모달 내용

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

    // 검색어 변경 시 디바운스를 적용하여 사용자 검색 실행
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300); // 300ms 지연

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // 탭이 변경될 때마다 해당 탭의 데이터를 불러옴
    useEffect(() => {
        if (tab === 0) {
            fetchFriends();
        } else if (tab === 1) {
            fetchPendingRequests();
        }
    }, [tab, user]);

    /**
     * @function fetchFriends
     * @description 친구 목록을 불러오는 함수
     */
    const fetchFriends = async () => {
        try {
            const response = await getFriendList();
            setFriends(response.data);
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        }
    };

    /**
     * @function fetchPendingRequests
     * @description 보류 중인 친구 요청 목록을 불러오는 함수
     */
    const fetchPendingRequests = async () => {
        try {
            const response = await getPendingFriendRequests();
            setPendingRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch pending requests:', error);
        }
    };

    /**
     * @function handleSearch
     * @description 닉네임으로 사용자를 검색하는 함수
     * @param {string} query - 검색어
     */
    const handleSearch = async (query) => {
        try {
            const response = await searchUsers(query);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Failed to search users:', error);
        }
    };

    /**
     * @function handleSendRequest
     * @description 친구 요청을 보내는 함수
     * @param {string} recipientId - 요청을 받는 사용자 ID
     */
    const handleSendRequest = async (recipientId) => {
        try {
            await sendFriendRequest(recipientId);
            showInfoModal('성공', '친구 요청을 보냈습니다.');
            // 요청 보낸 사용자를 검색 결과에서 제거
            setSearchResults(searchResults.filter(u => u.userId !== recipientId));
        } catch (error) {
            console.error('Failed to send friend request:', error);
            showInfoModal('오류', error.response?.data?.message || '친구 요청에 실패했습니다.');
        }
    };

    /**
     * @function handleAcceptRequest
     * @description 친구 요청을 수락하는 함수
     * @param {string} friendId - 요청을 보낸 사용자 ID
     */
    const handleAcceptRequest = async (friendId) => {
        try {
            await acceptFriendRequest(friendId);
            fetchPendingRequests(); // 보류중인 요청 목록 갱신
            fetchFriends(); // 친구 목록 갱신
        } catch (error) {
            console.error('Failed to accept friend request:', error);
        }
    };

    /**
     * @function handleRejectRequest
     * @description 친구 요청을 거절하는 함수
     * @param {string} friendId - 요청을 보낸 사용자 ID
     */
    const handleRejectRequest = async (friendId) => {
        try {
            await rejectFriendRequest(friendId);
            fetchPendingRequests(); // 보류중인 요청 목록 갱신
        } catch (error) {
            console.error('Failed to reject friend request:', error);
        }
    };

    /**
     * @function handleRemoveFriend
     * @description 친구를 삭제하는 함수
     * @param {string} friendId - 삭제할 친구 ID
     * @param {string} friendNickname - 삭제할 친구 닉네임
     */
    const handleRemoveFriend = (friendId, friendNickname) => {
        setConfirmModalContent({
            title: '친구 삭제',
            message: `'${friendNickname}'님을 친구 목록에서 삭제하시겠습니까?`,
            onConfirm: async () => {
                try {
                    await removeFriend(friendId);
                    fetchFriends(); // 친구 목록 갱신
                    showInfoModal('성공', '친구를 삭제했습니다.');
                } catch (error) {
                    console.error('Failed to remove friend:', error);
                    showInfoModal('오류', '친구 삭제에 실패했습니다.');
                }
            }
        });
        setConfirmModalOpen(true);
    };

    // JSX 렌더링
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 탭 메뉴 */}
            <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="fullWidth">
                <Tab label="Friends" />
                <Tab label="Pending" />
                <Tab label="Add Friend" />
            </Tabs>

            {/* 친구 목록 탭 */}
            {tab === 0 && (
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {friends.map(friend => (
                        <ListItem key={friend.userId} secondaryAction={<IconButton edge="end" onClick={() => handleRemoveFriend(friend.userId, friend.userNickname)}><DeleteIcon /></IconButton>}>
                            <ListItemText primary={friend.userNickname} />
                        </ListItem>
                    ))}
                </List>
            )}

            {/* 보류 중인 요청 탭 */}
            {tab === 1 && (
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {pendingRequests.map(request => (
                        <ListItem key={request.friendId} secondaryAction={
                            <>
                                <IconButton edge="end" onClick={() => handleAcceptRequest(request.friendId)}><CheckIcon /></IconButton>
                                <IconButton edge="end" onClick={() => handleRejectRequest(request.friendId)}><ClearIcon /></IconButton>
                            </>
                        }>
                            <ListItemText primary={request.requesterNickname} />
                        </ListItem>
                    ))}
                </List>
            )}

            {/* 친구 추가 탭 */}
            {tab === 2 && (
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Search by nickname" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} fullWidth />
                    <List>
                        {searchResults.map(user => (
                            <ListItem key={user.userId} secondaryAction={<IconButton edge="end" onClick={() => handleSendRequest(user.userId)}><AddIcon /></IconButton>}>
                                <ListItemText primary={user.userNickname} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            {/* 정보 및 확인 모달 */}
            <InfoModal
                open={isInfoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title={infoModalContent.title}
                message={infoModalContent.message}
            />
            <ConfirmModal
                open={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={confirmModalContent.onConfirm}
                title={confirmModalContent.title}
                message={confirmModalContent.message}
            />
        </Box>
    );
}

export default FriendsPanel;