import React, { useState, useEffect } from "react";
import SideBar from "./SideBar";
import ChatArea from "./ChatArea";
import Profile from "./Profile";
import { io } from 'socket.io-client';
import { useThemeContext } from '../ThemeContext';

const ChatWindow = ({ isLightTheme, onToggleTheme, currentUser }) => {
    const { fontSize } = useThemeContext();
    const [selectedChat, setSelectedChat] = useState(null);
    const [socket, setSocket] = useState(null);
    const [hiddenUsers, setHiddenUsers] = useState(new Set());

    // Initialize socket
    useEffect(() => {
        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    useEffect(() => {
        const userId = currentUser?._id || currentUser?.id;
        if (socket && userId) {
            socket.emit('identify', userId);

            // Listen for incoming messages to un-hide chats
            const handleReceiveMessage = (msg) => {
                setHiddenUsers(prev => {
                    if (prev.has(msg.from)) {
                        const newSet = new Set(prev);
                        newSet.delete(msg.from);
                        return newSet;
                    }
                    return prev;
                });
            };
            socket.on('receiveMessage', handleReceiveMessage);
            return () => {
                socket.off('receiveMessage', handleReceiveMessage);
            };
        }
    }, [socket, currentUser]);

    // Apply global font size
    useEffect(() => {
        const sizeMap = {
            small: '14px',
            medium: '16px',
            large: '20px'
        };
        document.documentElement.style.fontSize = sizeMap[fontSize] || '16px';
    }, [fontSize]);

    const handleCloseChat = () => {
        setSelectedChat(null);
    };

    const handleDeleteChat = (chatId) => {
        setHiddenUsers(prev => new Set(prev).add(chatId));
        setSelectedChat(null);
    };

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                background: isLightTheme ? "#f5f5f5" : "#101223",
                color: isLightTheme ? "#222" : "white",
                transition: 'background 0.2s',
            }}
        >
            <Profile currentUser={currentUser} />
            <SideBar
                isLightTheme={isLightTheme}
                onToggleTheme={onToggleTheme}
                currentUser={currentUser}
                onSelectChat={setSelectedChat}
                socket={socket}
                hiddenUsers={hiddenUsers}
            />
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    background: "transparent", // Allow ChatArea background to show
                    color: isLightTheme ? "#222" : "white",
                    transition: 'background 0.2s',
                }}
            >
                <ChatArea
                    isLightTheme={isLightTheme}
                    selectedChat={selectedChat}
                    currentUser={currentUser}
                    socket={socket}
                    onCloseChat={handleCloseChat}
                    onDeleteChat={handleDeleteChat}
                />
            </div>
        </div>
    );
};

export default ChatWindow;