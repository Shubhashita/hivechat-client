import React, { useState, useEffect } from "react";
import { useThemeContext } from '../ThemeContext';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from "@mui/icons-material/Search";
import { useRef } from 'react';
import { io } from 'socket.io-client';
import IconButton from '@mui/material/IconButton';
import {
    Box,
    Drawer,
    Tabs,
    Tab,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    InputAdornment,
    IconButton as MUIIconButton,
} from "@mui/material";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const drawerWidth = 320;


const SideBar = ({ refreshTrigger, currentUser, onSelectChat }) => {
    const { isLightTheme, toggleTheme } = useThemeContext();
    // Profile drawer state
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
    const handleProfileOpen = () => setProfileDrawerOpen(true);
    const handleProfileClose = () => setProfileDrawerOpen(false);
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState("");

    const [chats, setChats] = useState([]);
    const socketRef = useRef();

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io("http://localhost:5000");
        }
        const socket = socketRef.current;
        // Exclude current user from the list
        socket.emit('getUsers', { excludeId: currentUser?.id });
        socket.on('usersList', (data) => {
            console.log('Received usersList from backend:', data);
            setChats(data);
        });
        return () => {
            socket.off('usersList');
        };
    }, [refreshTrigger, currentUser]);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    // Show all users from the database (including current user)
    const filteredChats = chats.filter((chat) =>
        (chat.username || chat.name || "").toLowerCase().includes(search.toLowerCase())
    );


    // Logout dialog state
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const handleLogoutClick = () => setLogoutDialogOpen(true);
    const handleLogoutClose = () => setLogoutDialogOpen(false);
    const handleLogoutConfirm = () => {
        setLogoutDialogOpen(false);
        // Remove user from localStorage and redirect to home page
        localStorage.removeItem('currentUser');
        window.location.href = '/';
    };

    // Profile photo state (local only)
    const [profilePhoto, setProfilePhoto] = useState(null);

    // Settings drawer state
    const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
    const handleSettingsOpen = () => setSettingsDrawerOpen(true);
    const handleSettingsClose = () => setSettingsDrawerOpen(false);

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    backgroundColor: isLightTheme ? '#f5f5f5' : '#15161a',
                    color: isLightTheme ? '#222' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                },
            }}
        >
            <Box sx={{ p: 2, pb: 0 }}>
                <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search chats"
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: isLightTheme ? '#222' : 'white' }} />
                            </InputAdornment>
                        ),
                        style: { color: isLightTheme ? '#222' : 'white' },
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            color: isLightTheme ? '#222' : 'white',
                            '& fieldset': {
                                borderColor: isLightTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                            },
                            '&:hover fieldset': {
                                borderColor: isLightTheme ? '#222' : 'white',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: isLightTheme ? '#222' : 'white',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: isLightTheme ? '#222' : 'white',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: isLightTheme ? '#222' : 'white',
                        },
                    }}
                />
            </Box>
            <Box sx={{ height: 10 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 1 }}>
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons={false}
                    sx={{
                        minHeight: 36,
                        color: isLightTheme ? '#222' : '#e8e9ed',
                        flex: 1,
                        '.MuiTabs-flexContainer': {
                            alignItems: 'center',
                        },
                        '& .MuiTab-root': {
                            color: isLightTheme ? '#222' : '#e8e9ed',
                            borderRadius: '16px',
                            transition: 'background 0.2s',
                            '&:hover': {
                                color: isLightTheme ? '#222' : '#e8e9ed',
                                backgroundColor: isLightTheme ? 'rgba(0,0,0,0.04)' : 'rgba(232,233,237,0.08)',
                                borderRadius: '16px',
                                boxShadow: 'none',
                                outline: 'none',
                            },
                            minHeight: 36,
                            minWidth: 0,
                            padding: '6px 16px',
                            margin: '0 4px',
                            boxShadow: 'none',
                            outline: 'none',
                        },
                        '& .Mui-selected': { color: isLightTheme ? '#1976d2' : 'white', background: 'none', boxShadow: 'none', outline: 'none' },
                        '& .MuiTabs-indicator': { display: 'none' },
                    }}
                >
                    <Tab label="All Chats" />
                    <Tab label="Groups" />
                </Tabs>
            </Box>


            {/* Logout Dialog */}
            <Dialog
                open={logoutDialogOpen}
                onClose={handleLogoutClose}
                PaperProps={{
                    sx: {
                        backgroundColor: isLightTheme ? '#f5f5f5' : '#15161a',
                        color: isLightTheme ? '#222' : 'white',
                        minWidth: 320,
                        borderRadius: 3,
                        textAlign: 'center',
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1, color: isLightTheme ? '#222' : 'white' }}>Logout</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: isLightTheme ? '#222' : 'white', mb: 2 }}>
                        Are you sure you want to logout?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button onClick={handleLogoutClose} variant="outlined" sx={{ borderColor: isLightTheme ? '#1976d2' : '#fff', color: isLightTheme ? '#1976d2' : '#fff', mr: 2 }}>Cancel</Button>
                    <Button onClick={handleLogoutConfirm} variant="contained" sx={{ background: isLightTheme ? '#1976d2' : '#1976d2', color: 'white', '&:hover': { background: isLightTheme ? '#115293' : '#115293' } }}>Logout</Button>
                </DialogActions>
            </Dialog>
            {/* Tabs moved above, no duplicate */}
            <Box sx={{
                flex: 1,
                overflowY: "hidden",
                transition: 'background 0.2s',
                margin: '4px 0',
                background: isLightTheme ? '#fff' : 'transparent',
            }}>
                {tab === 0 && (
                    <List>
                        {/* Show all users from the database */}
                        {filteredChats.map((chat) => (
                            <ListItem
                                button
                                key={chat.id || chat.username || chat.email}
                                onClick={() => onSelectChat && onSelectChat(chat)}
                                sx={{
                                    transition: 'background 0.2s',
                                    margin: '4px 0',
                                    backgroundColor: isLightTheme ? '#fff' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: isLightTheme ? 'rgba(0,0,0,0.04)' : 'rgba(232,233,237,0.08)',
                                    },
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: isLightTheme ? '#e0e0e0' : '#0a2a2e', color: isLightTheme ? '#222' : 'white' }}>{(chat.username || chat.name || "U")[0]}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={chat.username || chat.name}
                                    primaryTypographyProps={{ fontWeight: "bold", color: isLightTheme ? '#222' : 'white' }}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
                {tab === 1 && (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color={isLightTheme ? '#222' : 'white'}>
                            No groups yet.
                        </Typography>
                    </Box>
                )}
            </Box>
            {/* Sidebar Footer */}
            <Box
                className="sidebar-footer-no-scroll"
                sx={{
                    width: '100%',
                    height: 48,
                    minHeight: 48,
                    maxHeight: 48,
                    px: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    background: isLightTheme ? '#f5f5f5' : '#15161a',
                    gap: 1,
                    overflow: 'hidden',
                    outline: 'none',
                    boxShadow: 'none',
                    flexShrink: 0,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}
            >
                <IconButton onClick={handleProfileOpen} sx={{ p: 0.5, color: isLightTheme ? '#222' : 'white', pointerEvents: 'auto' }}>
                    <AccountCircleIcon sx={{ fontSize: 28 }} />
                </IconButton>
                {/* Profile Drawer from bottom */}
                <SwipeableDrawer
                    anchor="bottom"
                    open={profileDrawerOpen}
                    onClose={handleProfileClose}
                    onOpen={handleProfileOpen}
                    ModalProps={{
                        container: document.getElementById('sidebar-drawer'),
                        style: { position: 'absolute' }
                    }}
                    PaperProps={{
                        sx: {
                            width: drawerWidth,
                            minHeight: 100,
                            background: isLightTheme ? '#fff' : '#23242a',
                            color: isLightTheme ? '#222' : 'white',
                            p: 3,
                            margin: 0,
                            left: 0,
                            right: 'auto',
                        }
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>Profile</Typography>
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
                        <label htmlFor="profile-photo-upload">
                            <input
                                id="profile-photo-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            setProfilePhoto(ev.target.result);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <Box sx={{ cursor: 'pointer' }}>
                                {profilePhoto ? (
                                    <Avatar src={profilePhoto} sx={{ width: 60, height: 60, mx: 'auto' }} />
                                ) : (
                                    <AccountCircleIcon sx={{ fontSize: 60, mx: 'auto', color: isLightTheme ? '#222' : 'white' }} />
                                )}
                                <Typography variant="caption" sx={{ display: 'block', color: isLightTheme ? '#1976d2' : '#90caf9', mt: 0.5 }}>
                                    Add Photo
                                </Typography>
                            </Box>
                        </label>
                    </Box>
                    <Typography variant="subtitle1">{currentUser?.username || 'User'}</Typography>
                    <Typography variant="body2" sx={{ color: isLightTheme ? '#666' : '#b0b3c6', mb: 2 }}>{currentUser?.email || ''}</Typography>
                </SwipeableDrawer>
                <IconButton onClick={handleSettingsOpen} sx={{ color: isLightTheme ? '#222' : 'white', ml: 1, p: 0.5, pointerEvents: 'auto' }}>
                    <SettingsIcon fontSize="medium" />
                </IconButton>
                {/* Settings Drawer from bottom */}
                <SwipeableDrawer
                    anchor="bottom"
                    open={settingsDrawerOpen}
                    onClose={handleSettingsClose}
                    onOpen={handleSettingsOpen}
                    PaperProps={{
                        sx: {
                            width: drawerWidth,
                            minHeight: 100,
                            background: isLightTheme ? '#fff' : '#23242a',
                            color: isLightTheme ? '#222' : 'white',
                            p: 3,
                            margin: 0,
                            left: 0,
                            right: 'auto',
                        }
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>Settings</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ flex: 1 }}>Theme</Typography>
                        <MUIIconButton onClick={toggleTheme} sx={{ ml: 2, color: isLightTheme ? '#222' : '#fff' }}>
                            {isLightTheme ? <DarkModeIcon /> : <LightModeIcon />}
                        </MUIIconButton>
                    </Box>
                    <Button onClick={handleLogoutClick} variant="contained" color="error" fullWidth>
                        Logout
                    </Button>
                </SwipeableDrawer>
            </Box>
        </Drawer >
    );
}

export default SideBar;
