import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getFriendList, getPendingFriendRequests, searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from '../api';
import InfoModal from './InfoModal';
import ConfirmModal from './ConfirmModal';
import { Box, Typography, Tabs, Tab, List, ListItem, ListItemText, Button, TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';

function FriendsPanel() {
    const { user } = useUser();
    const [tab, setTab] = useState(0);
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' });
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalContent, setConfirmModalContent] = useState({ title: '', message: '', onConfirm: () => {} });

    const showInfoModal = (title, message) => {
        setInfoModalContent({ title, message });
        setInfoModalOpen(true);
    };

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        if (tab === 0) {
            fetchFriends();
        } else if (tab === 1) {
            fetchPendingRequests();
        }
    }, [tab, user]);

    const fetchFriends = async () => {
        try {
            const response = await getFriendList();
            setFriends(response.data);
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await getPendingFriendRequests();
            setPendingRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch pending requests:', error);
        }
    };

    const handleSearch = async (query) => {
        try {
            const response = await searchUsers(query);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Failed to search users:', error);
        }
    };

    const handleSendRequest = async (recipientId) => {
        try {
            await sendFriendRequest(recipientId);
            showInfoModal('성공', '친구 요청을 보냈습니다.');
            setSearchResults(searchResults.filter(u => u.userId !== recipientId));
        } catch (error) {
            console.error('Failed to send friend request:', error);
            showInfoModal('오류', error.response?.data?.message || '친구 요청에 실패했습니다.');
        }
    };

    const handleAcceptRequest = async (friendId) => {
        try {
            await acceptFriendRequest(friendId);
            fetchPendingRequests();
            fetchFriends(); // Refresh friend list
        } catch (error) {
            console.error('Failed to accept friend request:', error);
        }
    };

    const handleRejectRequest = async (friendId) => {
        try {
            await rejectFriendRequest(friendId);
            fetchPendingRequests();
        } catch (error) {
            console.error('Failed to reject friend request:', error);
        }
    };

    const handleRemoveFriend = (friendId, friendNickname) => {
        setConfirmModalContent({
            title: '친구 삭제',
            message: `'${friendNickname}'님을 친구 목록에서 삭제하시겠습니까?`,
            onConfirm: async () => {
                try {
                    await removeFriend(friendId);
                    fetchFriends();
                    showInfoModal('성공', '친구를 삭제했습니다.');
                } catch (error) {
                    console.error('Failed to remove friend:', error);
                    showInfoModal('오류', '친구 삭제에 실패했습니다.');
                }
            }
        });
        setConfirmModalOpen(true);
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="fullWidth">
                <Tab label="Friends" />
                <Tab label="Pending" />
                <Tab label="Add Friend" />
            </Tabs>

            {tab === 0 && (
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {friends.map(friend => (
                        <ListItem key={friend.userId} secondaryAction={<IconButton edge="end" onClick={() => handleRemoveFriend(friend.userId, friend.userNickname)}><DeleteIcon /></IconButton>}>
                            <ListItemText primary={friend.userNickname} />
                        </ListItem>
                    ))}
                </List>
            )}

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
