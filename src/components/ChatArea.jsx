import React, { useState, useEffect, useRef } from "react";
import { Box, Card, CardContent, Typography, TextField, IconButton, List, ListItem, Avatar, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { io } from 'socket.io-client';
import { useThemeContext } from '../ThemeContext';




const ENDPOINT = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
const socket = io(ENDPOINT);

const ChatArea = ({ selectedChat, currentUser }) => {
    const { isLightTheme } = useThemeContext();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // Identify user on mount
    useEffect(() => {
        if (currentUser?.id) {
            socket.emit('identify', currentUser.id);
        }
    }, [currentUser]);

    // Listen for incoming messages
    useEffect(() => {
        const handleReceive = (msg) => {
            // Defensive: Only process if both selectedChat and currentUser exist and have id
            if (!selectedChat || !currentUser || !selectedChat.id || !currentUser.id) return;
            // Always show messages for this chat, regardless of sender
            if (
                (msg.from === currentUser.id && msg.to === selectedChat.id) ||
                (msg.from === selectedChat.id && msg.to === currentUser.id)
            ) {
                setMessages((prev) => {
                    // Prevent duplicate messages (in case of echo)
                    if (prev.length > 0 && prev[prev.length - 1].text === msg.text && prev[prev.length - 1].time === msg.time && prev[prev.length - 1].from === msg.from) {
                        return prev;
                    }
                    return [...prev, msg];
                });
            }
        };
        socket.on('receiveMessage', handleReceive);
        return () => {
            socket.off('receiveMessage', handleReceive);
        };
    }, [selectedChat, currentUser]);


    // Fetch messages from backend when chat changes
    useEffect(() => {
        if (!selectedChat || !currentUser) {
            setMessages([]);
            return;
        }
        const fetchMessages = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/messages?user1=${currentUser.id}&user2=${selectedChat.id}`,
                    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
                );
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.map(m => ({
                        ...m,
                        from: m.sender_id,
                        to: m.recipient_id,
                        text: m.text,
                        time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : '',
                    })));
                } else {
                    setMessages([]);
                }
            } catch (err) {
                setMessages([]);
            }
        };
        fetchMessages();
    }, [selectedChat, currentUser]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);


    const handleSend = async () => {
        if (input.trim() === "" || !selectedChat) return;
        const msg = {
            from: currentUser.id,
            to: selectedChat.id,
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
        };
        // Save to backend first
        try {
            const res = await fetch('http://localhost:5000/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: msg.from,
                    recipient_id: msg.to,
                    text: msg.text,
                    timestamp: new Date().toISOString()
                })
            });
            if (res.ok) {
                const saved = await res.json();
                msg.time = saved.timestamp ? new Date(saved.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : msg.time;
            }
        } catch (err) {
            // Optionally show error
        }
        socket.emit('sendMessage', msg);
        setInput("");
    };

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") handleSend();
    };

    if (!selectedChat || !currentUser || !selectedChat.id || !currentUser.id) {
        return (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", background: isLightTheme ? "#fff" : "#15161a", alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color={isLightTheme ? '#888' : '#b0b3c6'}>Select a chat to start messaging</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", background: isLightTheme ? "#fff" : "#15161a" }}>
            {/* Chat Card at the top */}
            <Card sx={{ background: isLightTheme ? "#f5f5f5" : "#15161a", color: isLightTheme ? "#222" : "#fff", boxShadow: 2, borderRadius: 0, minHeight: 48 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", py: 0.5, minHeight: 40, '&:last-child': { pb: 1 } }}>
                    <Avatar sx={{ bgcolor: isLightTheme ? "#e0e0e0" : "#0a2a2e", color: isLightTheme ? "#222" : "white", mr: 2 }}>{selectedChat.username ? selectedChat.username[0] : "C"}</Avatar>
                    <Box>
                        <Typography variant="h6">{selectedChat.username || selectedChat.name || "Chat"}</Typography>
                        <Typography variant="body2" color={isLightTheme ? "#666" : "#b0b3c6"}>Online</Typography>
                    </Box>
                </CardContent>
            </Card>
            {/* Chat Messages */}
            <Paper
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    background: isLightTheme ? '#f5f5f5' : '#414142',
                    borderRadius: 0,
                    scrollbarWidth: 'thin',
                    scrollbarColor: isLightTheme ? '#bdbdbd #f5f5f5' : '#333 #414142',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        background: isLightTheme ? '#f5f5f5' : '#414142',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: isLightTheme ? '#bdbdbd' : '#333',
                        borderRadius: '8px',
                        minHeight: '2px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: isLightTheme ? '#9e9e9e' : '#222',
                    },
                    '&::-webkit-scrollbar-button': {
                        display: 'none',
                        width: 0,
                        height: 0,
                        background: 'transparent',
                        border: 'none',
                        content: 'none',
                    },
                }}
                elevation={0}
            >
                <List>
                    {messages.map((msg, idx) => {
                        // Defensive: check sender exists and has id
                        const senderId = msg.sender?.id ?? msg.from;
                        if (typeof senderId === 'undefined' || !currentUser || !currentUser.id) return null;
                        const isCurrentUser = senderId === currentUser.id;
                        return (
                            <ListItem key={msg.id || idx} sx={{ justifyContent: isCurrentUser ? "flex-end" : "flex-start" }}>
                                <Box sx={{
                                    bgcolor: isCurrentUser ? (isLightTheme ? "#e3f2fd" : "#0a2a2e") : (isLightTheme ? "#fff" : "#15161a"),
                                    color: isLightTheme ? "#222" : "#fff",
                                    px: 2, py: 1,
                                    maxWidth: '70%',
                                    wordBreak: 'break-word',
                                    boxShadow: 1,
                                    display: 'flex',
                                    gap: 1,
                                    borderRadius: 18,
                                }}>
                                    <Typography variant="body2" sx={{ display: 'inline' }}>{msg.text}</Typography>
                                </Box>
                            </ListItem>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </List>
            </Paper>
            {/* Input Area */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, background: isLightTheme ? "#f5f5f5" : "#15161a" }}>
                <TextField
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{
                        input: { color: isLightTheme ? '#222' : 'white' },
                        '& .MuiOutlinedInput-root': {
                            color: isLightTheme ? '#222' : 'white',
                            '& fieldset': { borderColor: isLightTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' },
                            '&:hover fieldset': { borderColor: isLightTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: isLightTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' },
                            boxShadow: 'none',
                            outline: 'none',
                        },
                    }}
                    InputProps={{ style: { color: isLightTheme ? '#222' : 'white' } }}
                    disabled={!selectedChat}
                />
                <IconButton color="primary" onClick={handleSend} disabled={!selectedChat || input.trim() === ""} sx={{ bgcolor: isLightTheme ? '#e3f2fd' : 'rgba(255,255,255,0.5)', color: isLightTheme ? '#1976d2' : 'white', '&:hover': { bgcolor: isLightTheme ? '#bbdefb' : '#15161a' } }}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
}

export default ChatArea;
