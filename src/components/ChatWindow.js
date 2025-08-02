import React from "react";
import SideBar from "./SideBar";
import ChatArea from "./ChatArea";


import { useState } from "react";

const ChatWindow = ({ isLightTheme, onToggleTheme, currentUser }) => {
    const [selectedChat, setSelectedChat] = useState(null);
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
            <SideBar isLightTheme={isLightTheme} onToggleTheme={onToggleTheme} currentUser={currentUser} onSelectChat={setSelectedChat} />
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    background: isLightTheme ? "#fff" : "#181a23",
                    color: isLightTheme ? "#222" : "white",
                    transition: 'background 0.2s',
                }}
            >
                <ChatArea isLightTheme={isLightTheme} selectedChat={selectedChat} currentUser={currentUser} />
            </div>
        </div>
    );
};

export default ChatWindow;