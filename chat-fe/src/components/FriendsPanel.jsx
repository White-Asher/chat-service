import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getFriendList, getPendingFriendRequests, searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from '../api';
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

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const response = await searchUsers(searchQuery);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Failed to search users:', error);
        }
    };

    const handleSendRequest = async (recipientId) => {
        try {
            await sendFriendRequest(recipientId);
            alert('Friend request sent.');
            setSearchResults(searchResults.filter(u => u.userId !== recipientId));
        } catch (error) {
            console.error('Failed to send friend request:', error);
            alert('Failed to send friend request.');
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

    const handleRemoveFriend = async (friendId) => {
        if (window.confirm('Are you sure you want to remove this friend?')) {
            try {
                await removeFriend(friendId);
                fetchFriends();
            } catch (error) {
                console.error('Failed to remove friend:', error);
            }
        }
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
                        <ListItem key={friend.userId} secondaryAction={<IconButton edge="end" onClick={() => handleRemoveFriend(friend.userId)}><DeleteIcon /></IconButton>}>
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField label="Search by nickname" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} fullWidth />
                        <Button variant="contained" onClick={handleSearch}>Search</Button>
                    </Box>
                    <List>
                        {searchResults.map(user => (
                            <ListItem key={user.userId} secondaryAction={<IconButton edge="end" onClick={() => handleSendRequest(user.userId)}><AddIcon /></IconButton>}>
                                <ListItemText primary={user.userNickname} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
        </Box>
    );
}

export default FriendsPanel;
