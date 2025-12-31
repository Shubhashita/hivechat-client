import React, { useState, useEffect, useRef } from "react";
import { Avatar, Typography, IconButton, Menu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MicIcon from "@mui/icons-material/Mic";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useThemeContext } from '../ThemeContext';

// Custom Audio Player Component
const AudioMessage = ({ src, time, isCurrentUser, userAvatar }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    // Ensure src includes the server URL if it's a relative path
    const getAudioSrc = (source) => {
        if (!source) return "";
        if (source.startsWith('data:') || source.startsWith('blob:') || source.startsWith('http')) {
            return source;
        }
        return `${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}${source.startsWith('/') ? '' : '/'}${source}`;
    };

    const audioSrc = getAudioSrc(src);

    const togglePlay = async () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (err) {
                    console.error("Audio playback error:", err);
                    setIsPlaying(false);
                }
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            if (audioRef.current.duration) {
                setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Fake waveform bars
    const bars = [3, 5, 8, 5, 4, 6, 9, 12, 8, 5, 3, 6, 9, 11, 7, 4, 2, 5, 8, 4, 3, 5, 8, 5, 3, 5, 8, 5, 3];

    return (
        <div className="flex items-center gap-3 p-1 min-w-[300px] h-[65px]">
            <audio
                ref={audioRef}
                src={audioSrc}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onError={(e) => console.error("Audio tag error:", e.target.error, "Src:", audioSrc)}
            />

            {/* Avatar Section */}
            <div className="relative flex-shrink-0">
                <Avatar
                    src={userAvatar || null}
                    sx={{ width: 48, height: 48 }}
                >
                    {!userAvatar && "U"}
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-[#005c4b] rounded-full p-[2px] border border-[#005c4b]">
                    <MicIcon sx={{ fontSize: 14, color: '#f0f2f5' }} />
                </div>
            </div>

            {/* Controls & Waveform Section */}
            <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="flex items-center gap-2">
                    <IconButton onClick={togglePlay} sx={{ padding: 0, color: '#d1d5db' }}>
                        {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
                    </IconButton>

                    {/* Visual Waveform */}
                    <div className="flex items-center gap-[2px] h-8 flex-1">
                        {bars.map((height, i) => (
                            <div
                                key={i}
                                className={`w-[3px] rounded-full transition-colors duration-200 ${(i / bars.length) * 100 < progress ? 'bg-[#53bdeb]' : 'bg-white/40'
                                    }`}
                                style={{ height: `${height * 1.5}px` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-center text-[11px] text-white/70 px-1">
                    <span>{formatTime(currentTime || duration)}</span>
                    <div className="flex items-center gap-1">
                        <span>{time}</span>
                        {isCurrentUser && <DoneAllIcon sx={{ fontSize: 14, color: '#53bdeb' }} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChatArea = ({ selectedChat, currentUser, socket, onCloseChat, onDeleteChat }) => {
    const { isLightTheme } = useThemeContext();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchMatches, setSearchMatches] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const messagesEndRef = useRef(null);
    const messageRefs = useRef({});

    const openMenu = Boolean(anchorEl);
    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleClearChat = async () => {
        const currentUserId = currentUser?._id || currentUser?.id;
        if (!selectedChat || !currentUserId) return;

        try {
            await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/messages?user1=${currentUserId}&user2=${selectedChat.id}`, {
                method: 'DELETE'
            });
            setMessages([]);
            handleMenuClose();
        } catch (error) {
            console.error("Error clearing chat:", error);
        }
    };

    const handleDeleteChatAction = async () => {
        // First clear messages (optional but cleaner)
        await handleClearChat();
        // Then hide the user
        if (onDeleteChat && selectedChat) {
            onDeleteChat(selectedChat.id);
        }
        handleMenuClose();
    };

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fileInputRef = useRef(null);

    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Audio Recording Logic
    const handleAudioRecord = async () => {
        if (!isRecording) {
            // Start Recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                    // Convert to Base64
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        const base64Audio = reader.result;
                        sendMediaMessage('audio', base64Audio);
                    };

                    stream.getTracks().forEach(track => track.stop()); // Stop mic
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone", err);
            }
        } else {
            // Stop Recording
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
        }
    };

    const sendMediaMessage = async (type, fileUrl) => {
        const currentUserId = currentUser?._id || currentUser?.id;
        if (!selectedChat || !socket || !currentUserId) return;

        const msg = {
            from: currentUserId,
            to: selectedChat.id,
            text: "",
            type: type,
            fileUrl: fileUrl,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
        };

        // Emit to socket
        socket.emit('sendMessage', msg);

        // Optimistic update
        setMessages(prev => [...prev, msg]);

        // Save to DB
        try {
            await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: msg.from,
                    recipient_id: msg.to,
                    text: msg.text,
                    type: msg.type,
                    fileUrl: msg.fileUrl
                })
            });
        } catch (err) {
            console.error("Failed to save media message", err);
        }
    };

    // Identify user logic moved to ChatWindow, but we ensure we are ready
    // No need to identify here anymore


    // Search Logic
    useEffect(() => {
        if (!searchText) {
            setSearchMatches([]);
            setCurrentSearchIndex(0);
            return;
        }
        const matches = messages.reduce((acc, msg, idx) => {
            if (msg.text && msg.text.toLowerCase().includes(searchText.toLowerCase())) {
                acc.push(msg.id || idx);
            }
            return acc;
        }, []);
        setSearchMatches(matches);
        setCurrentSearchIndex(0);

        // Scroll to first match if exists
        if (matches.length > 0) {
            const firstMatchId = matches[0];
            if (messageRefs.current[firstMatchId]) {
                messageRefs.current[firstMatchId].scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [searchText, messages]);


    const handleNextMatch = () => {
        if (searchMatches.length === 0) return;
        const nextIndex = (currentSearchIndex + 1) % searchMatches.length;
        setCurrentSearchIndex(nextIndex);
        const matchId = searchMatches[nextIndex];
        if (messageRefs.current[matchId]) {
            messageRefs.current[matchId].scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    const handlePrevMatch = () => {
        if (searchMatches.length === 0) return;
        const prevIndex = (currentSearchIndex - 1 + searchMatches.length) % searchMatches.length;
        setCurrentSearchIndex(prevIndex);
        const matchId = searchMatches[prevIndex];
        if (messageRefs.current[matchId]) {
            messageRefs.current[matchId].scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };


    // Listen for incoming messages
    useEffect(() => {
        if (!socket) return;

        const currentUserId = currentUser?._id || currentUser?.id;

        const handleReceive = (msg) => {
            if (!selectedChat || !currentUserId || !selectedChat.id) return;
            // Check if message belongs to this chat
            if (
                (msg.from === currentUserId && msg.to === selectedChat.id) ||
                (msg.from === selectedChat.id && msg.to === currentUserId)
            ) {
                setMessages((prev) => {
                    // Prevent duplicates
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.text === msg.text && lastMsg.time === msg.time && lastMsg.from === msg.from) {
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
    }, [selectedChat, currentUser, socket]);


    // Fetch messages
    useEffect(() => {
        const currentUserId = currentUser?._id || currentUser?.id;

        if (!selectedChat || !currentUserId) {
            setMessages([]);
            return;
        }
        const fetchMessages = async () => {
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/messages?user1=${currentUserId}&user2=${selectedChat.id}`,
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

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);


    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        const currentUserId = currentUser?._id || currentUser?.id;

        if ((input.trim() === "" && !selectedFile) || !selectedChat || !socket || !currentUserId || isSending) return;

        setIsSending(true);
        let fileData = null;

        try {
            // Upload file if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const res = await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error('Upload failed');

                fileData = await res.json();
            }

            const msg = {
                from: currentUserId,
                to: selectedChat.id,
                text: input,
                type: fileData ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text',
                fileUrl: fileData ? fileData.fileUrl : "",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
            };

            // Emit to socket
            socket.emit('sendMessage', msg);

            // Optimistic update
            setMessages(prev => [...prev, msg]);

            // Save to DB
            await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: msg.from,
                    recipient_id: msg.to,
                    text: msg.text,
                    type: msg.type,
                    fileUrl: msg.fileUrl
                })
            });

            setInput("");
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (err) {
            console.error("Failed to send/upload", err);
            alert("Failed to send message. Please check your internet connection or server logs.");
        } finally {
            setIsSending(false);
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    // Helper to highlight search text
    const renderMessageText = (text) => {
        if (!searchText || !showSearch) return text;
        const parts = text.split(new RegExp(`(${searchText})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === searchText.toLowerCase() ? <span key={i} className="bg-yellow-500/40 text-white rounded px-0.5">{part}</span> : part
        );
    };

    const currentUserId = currentUser?._id || currentUser?.id;

    if (!selectedChat || !currentUserId || !selectedChat.id) {
        return (
            <div className={`flex-1 flex flex-col h-screen items-center justify-center transition-colors duration-500
                bg-[#072423]`}>
                <div className="bg-white/10 p-8 rounded-full animate-pop">
                    <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="Chat" className="w-24 h-24 opacity-20 filter grayscale" />
                </div>
                <Typography variant="h6" className={`mt-4 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select a conversation to start chatting
                </Typography>
            </div>
        );
    }



    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
        e.target.value = null; // Reset input
    };



    const handleOpenCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera", err);
            setShowCamera(false);
        }
    };

    const handleCloseCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        setShowCamera(false);
    };

    const handleCapturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            const { videoWidth, videoHeight } = videoRef.current;
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
            context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

            canvasRef.current.toBlob((blob) => {
                const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                handleCloseCamera();
            }, 'image/jpeg');
        }
    };

    return (
        <div className={`flex-1 flex flex-col h-screen relative transition-colors duration-500
            bg-[#072423]`}>

            {/* Camera Overlay */}
            {showCamera && (
                <div className="absolute inset-0 z-50 bg-black flex flex-col">
                    <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full h-full" />
                    <canvas ref={canvasRef} hidden />

                    {/* Camera Controls */}
                    <div className="absolute top-4 left-4 z-50">
                        <IconButton onClick={handleCloseCamera} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}>
                            <CloseIcon />
                        </IconButton>
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50">
                        <button
                            onClick={handleCapturePhoto}
                            className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 shadow-lg active:scale-95 transition-transform"
                        />
                    </div>
                </div>
            )}

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-vintage-pattern"></div>

            {/* Header */}
            <div className={`relative z-10 mx-4 mt-4 mb-2 p-3 flex items-center border-b border-white/10`}>

                {/* Left Side: User Info (Always Visible) */}
                <div className="flex items-center">
                    <Avatar sx={{ bgcolor: '#00d2d3', width: 44, height: 44, mr: 2 }}>
                        {selectedChat.username ? selectedChat.username[0] : "C"}
                    </Avatar>
                    <div>
                        <Typography variant="h6" fontWeight="700" className="text-white">
                            {selectedChat.username || selectedChat.name || "Chat"}
                        </Typography>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <Typography variant="caption" className="text-white/70">Online</Typography>
                        </div>
                    </div>
                </div>

                {/* Right Side: Search & Menu */}
                <div className="ml-auto flex items-center gap-1">

                    {/* Search Input (Expands when visible) */}
                    <div className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${showSearch ? 'w-64 opacity-100 mr-2' : 'w-0 opacity-0'}`}>
                        <input
                            ref={input => input && showSearch && input.focus()}
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder=""
                            className="w-full bg-transparent border-b border-white/50 text-white placeholder-white/50 focus:outline-none pb-1"
                        />
                        {/* Search Navigation Controls (Inside Input Area if needed or next to it) */}
                        {showSearch && searchText && (
                            <div className="flex items-center -ml-16">
                                <IconButton onClick={handlePrevMatch} size="small" sx={{ color: 'white' }} disabled={searchMatches.length === 0}>
                                    <KeyboardArrowUpIcon fontSize="small" />
                                </IconButton>
                                <IconButton onClick={handleNextMatch} size="small" sx={{ color: 'white' }} disabled={searchMatches.length === 0}>
                                    <KeyboardArrowDownIcon fontSize="small" />
                                </IconButton>
                            </div>
                        )}
                    </div>

                    <IconButton onClick={() => {
                        if (showSearch) {
                            setShowSearch(false);
                            setSearchText("");
                        } else {
                            setShowSearch(true);
                        }
                    }} sx={{ color: 'white' }}>
                        <SearchIcon />
                    </IconButton>

                    <IconButton onClick={handleMenuClick} sx={{ color: 'white' }}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleMenuClose}
                        PaperProps={{
                            style: {
                                backgroundColor: isLightTheme ? '#ffffff' : '#233138',
                                color: isLightTheme ? '#000000' : '#ffffff',
                                minWidth: '200px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            },
                        }}
                    >
                        <MenuItem onClick={() => { console.log('Contact info'); handleMenuClose(); }}>
                            <ListItemIcon>
                                <InfoIcon fontSize="small" sx={{ color: isLightTheme ? 'inherit' : 'white' }} />
                            </ListItemIcon>
                            Contact info
                        </MenuItem>
                        <MenuItem onClick={() => { if (onCloseChat) onCloseChat(); handleMenuClose(); }}>
                            <ListItemIcon>
                                <CloseIcon fontSize="small" sx={{ color: isLightTheme ? 'inherit' : 'white' }} />
                            </ListItemIcon>
                            Close chat
                        </MenuItem>
                        <Divider sx={{ my: 0.5, borderColor: isLightTheme ? '' : 'rgba(255,255,255,0.1)' }} />
                        <MenuItem onClick={() => { console.log('Block'); handleMenuClose(); }}>
                            <ListItemIcon>
                                <BlockIcon fontSize="small" sx={{ color: isLightTheme ? 'inherit' : 'white' }} />
                            </ListItemIcon>
                            Block
                        </MenuItem>
                        <MenuItem onClick={handleClearChat}>
                            <ListItemIcon>
                                <DeleteSweepIcon fontSize="small" sx={{ color: isLightTheme ? 'inherit' : 'white' }} />
                            </ListItemIcon>
                            Clear chat
                        </MenuItem>
                        <MenuItem onClick={handleDeleteChatAction} sx={{ color: '#f15c6d' }}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" sx={{ color: '#f15c6d' }} />
                            </ListItemIcon>
                            Delete chat
                        </MenuItem>
                    </Menu>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
                {messages.map((msg, idx) => {
                    const senderId = msg.sender?.id ?? msg.from;
                    if (senderId === undefined) return null;
                    const isCurrentUser = senderId === currentUserId;
                    const msgId = msg.id || idx;

                    return (
                        <div
                            key={msgId}
                            ref={(el) => (messageRefs.current[msgId] = el)}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} animate-slide-up`}
                        >
                            <div className={`
                                max-w-[70%] ${msg.type === 'image' ? 'p-1' : 'px-2 py-1'} rounded-lg shadow-sm text-sm border border-transparent box-border
                                relative min-w-[5rem]
                                ${isCurrentUser
                                    ? 'bg-[#005c4b] text-white rounded-tr-none'
                                    : `${isLightTheme ? 'bg-white text-gray-800' : 'bg-[#202c33] text-white'} rounded-tl-none`
                                } 
                                transition-all duration-200
                            `}
                            >
                                {msg.type === 'audio' ? (
                                    <AudioMessage
                                        src={msg.fileUrl}
                                        time={msg.time}
                                        isCurrentUser={isCurrentUser}
                                        userAvatar={isCurrentUser ? currentUser?.profile_pic : (selectedChat?.profile_pic || selectedChat?.avatar)}
                                    />
                                ) : (
                                    <>
                                        {msg.type === 'image' ? (
                                            <div className="relative rounded overflow-hidden">
                                                <img
                                                    src={msg.fileUrl}
                                                    alt="Shared media"
                                                    className="max-w-[300px] w-full h-auto object-cover cursor-pointer"
                                                    onClick={() => window.open(msg.fileUrl, '_blank')}
                                                />
                                                {/* Gradient Overlay for Timestamp visibility */}
                                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                                                {/* Timestamp Overlay */}
                                                <div className="absolute bottom-1 right-2 flex items-center gap-1 z-10">
                                                    {msg.time && (
                                                        <span className="text-[10px] text-white/90 font-medium leading-none">
                                                            {msg.time}
                                                        </span>
                                                    )}
                                                    {isCurrentUser && (
                                                        <DoneAllIcon sx={{ fontSize: 13, color: '#53bdeb' }} />
                                                    )}
                                                </div>
                                            </div>
                                        ) : msg.type === 'file' ? (
                                            <div className="flex items-center gap-2 p-2 bg-black/20 rounded mt-1 mb-1">
                                                <AttachFileIcon fontSize="small" />
                                                <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="underline text-sm truncate max-w-[150px]">
                                                    Download File
                                                </a>
                                            </div>
                                        ) : (
                                            <span className="break-words text-[15px] leading-snug">
                                                {renderMessageText(msg.text)}
                                            </span>
                                        )}

                                        {/* Footer for non-audio/non-image messages */}
                                        {msg.type !== 'image' && (
                                            <div className="float-right ml-2 mt-1 flex items-center gap-1 h-full align-bottom">
                                                {msg.time && (
                                                    <span className="text-[10px] opacity-70 leading-none pt-1">
                                                        {msg.time}
                                                    </span>
                                                )}
                                                {isCurrentUser && (
                                                    <DoneAllIcon sx={{ fontSize: 14, color: '#53bdeb' }} />
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* File Preview */}
            {selectedFile && (
                <div className="absolute bottom-20 left-4 z-20 bg-[#202c33] p-2 rounded-lg shadow-lg flex items-center gap-2 border border-white/10 animate-fade-in-up">
                    {previewUrl ? (
                        <div className="relative">
                            <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
                            <div className="absolute -top-1 -right-1 bg-black rounded-full p-0.5" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-white/10 rounded-md flex flex-col items-center justify-center text-white/70">
                            <AttachFileIcon />
                            <span className="text-[10px] truncate max-w-full px-1">{selectedFile.name.slice(-4)}</span>
                        </div>
                    )}
                    <div className="flex flex-col justify-center gap-1">
                        <span className="text-white text-sm font-medium truncate max-w-[150px]">{selectedFile.name}</span>
                        <span className="text-white/50 text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <IconButton
                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                        sx={{ color: 'white/70', marginLeft: 'auto', '&:hover': { color: '#f15c6d' } }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>
            )}

            {/* Input Area */}
            <div className="relative z-10 p-4 pt-2">
                <div className={`flex items-center gap-2 p-1 pl-2 rounded-full border border-white/10 backdrop-blur-md transition-all duration-300 ring-0 focus-within:ring-1 ring-white/30
                     bg-white/5`}>

                    <button
                        onClick={handleAudioRecord}
                        className={`p-2 transition-colors rounded-full hover:bg-white/10 ${isRecording ? 'text-red-500 animate-pulse' : 'text-white/50 hover:text-white'}`}
                    >
                        <MicIcon fontSize="small" />
                    </button>

                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder={isRecording ? "Listening..." : "Type a message..."}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium h-8 text-white placeholder-white/40 ml-1"
                        disabled={isRecording}
                    />

                    <div className="flex items-center gap-1 mr-1">
                        <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10">
                            <AttachFileIcon fontSize="small" />
                        </button>
                        <button onClick={handleOpenCamera} className="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10">
                            <CameraAltIcon fontSize="small" />
                        </button>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!selectedChat || (input.trim() === "" && !selectedFile)}
                        className={`p-2 rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10
                            ${(input.trim() || selectedFile) ? 'text-[#00d2d3] shadow-none' : 'text-white/30'}`}
                    >
                        <SendIcon fontSize="small" />
                    </button>
                </div>
            </div>
        </div >
    );
}

export default ChatArea;
