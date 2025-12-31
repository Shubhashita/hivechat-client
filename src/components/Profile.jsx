import React from 'react';
import { useThemeContext } from '../ThemeContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { IconButton, Tooltip } from '@mui/material';

import logo from "../assets/hive.png";

const Profile = ({ currentUser }) => {
    const { isLightTheme, toggleTheme, fontSize, setFontSize } = useThemeContext();
    const [showPopup, setShowPopup] = React.useState(false);
    const [showSettingsPopup, setShowSettingsPopup] = React.useState(false);
    const [aboutText, setAboutText] = React.useState("Hey there! I am using Hive Chat.");
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

    // Toggle popup
    // Toggle popup
    const handleProfileClick = (e) => {
        e.stopPropagation();
        if (showSettingsPopup) setShowSettingsPopup(false);
        setShowPopup(!showPopup);
    };

    const handleSettingsClick = (e) => {
        e.stopPropagation();
        if (showPopup) setShowPopup(false);
        setShowSettingsPopup(!showSettingsPopup);
    };

    // Close popup when clicking outside (simple implementation)
    React.useEffect(() => {
        const checkOutsideClick = (e) => {
            if (showPopup) setShowPopup(false);
            if (showSettingsPopup) setShowSettingsPopup(false);
        };
        window.addEventListener('click', checkOutsideClick);
        return () => window.removeEventListener('click', checkOutsideClick);
    }, [showPopup, showSettingsPopup]);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '60px', // Thin rail
        height: '100%',
        backgroundColor: isLightTheme ? '#072423' : '#111827', // Matching Sidebar
        borderRight: `1px solid ${isLightTheme ? 'rgba(255,255,255,0.1)' : '#2a2b36'}`,
        paddingTop: '20px',
        paddingBottom: '20px',
        justifyContent: 'space-between', // Top items and bottom items
        position: 'relative',
        zIndex: 100 // Ensure it stays o top of Sidebar
    };

    const iconStyle = {
        color: '#fff',
        marginBottom: '20px',
    };

    const handleLogout = async () => {
        try {
            const token = sessionStorage.getItem("token");
            if (token) {
                await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/user/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.error("Logout warning", err);
        }
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("currentUser");
        window.location.href = "/login";
    };

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                    src={logo}
                    alt="Logo"
                    style={{
                        width: '32px',
                        height: '32px',
                        objectFit: 'contain',
                        filter: "brightness(0) saturate(100%) invert(57%) sepia(91%) saturate(347%) hue-rotate(124deg) brightness(91%) contrast(85%)",
                        marginBottom: '20px'
                    }}
                />

                {/* Placeholder for other navigation items like "Chats", "Calls" if needed */}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Tooltip title="Profile" placement="right">
                    <IconButton sx={iconStyle} onClick={handleProfileClick}>
                        <AccountCircleIcon fontSize="medium" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Settings" placement="right">
                    <IconButton sx={iconStyle} onClick={handleSettingsClick}>
                        <SettingsIcon fontSize="medium" />
                    </IconButton>
                </Tooltip>

                {/* Settings Popup Card */}
                {showSettingsPopup && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            left: '65px',
                            bottom: '20px',
                            width: '300px',
                            backgroundColor: '#1f2937', // Forced Dark
                            borderRadius: '0px',
                            boxShadow: '5px 0 15px rgba(0,0,0,0.3)',
                            zIndex: 50,
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', // Forced White
                            cursor: 'default',
                            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                            transformOrigin: 'bottom left'
                        }}
                    >
                        {/* Header */}
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Settings</div>

                        {/* Font Size Option */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600', opacity: 0.8 }}>Font Size</label>
                            <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: '#374151', borderRadius: '8px' }}>
                                {['small', 'medium', 'large'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setFontSize(size)}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            backgroundColor: fontSize === size ? '#4b5563' : 'transparent',
                                            color: '#fff',
                                            boxShadow: fontSize === size ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            textTransform: 'capitalize',
                                            fontWeight: fontSize === size ? 'bold' : 'normal',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme Toggle (Moved) */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid #374151',
                            paddingTop: '16px'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Dark Mode</span>
                            <div
                                onClick={toggleTheme}
                                style={{
                                    width: '44px',
                                    height: '24px',
                                    backgroundColor: isLightTheme ? '#ccc' : '#2dd4bf',
                                    borderRadius: '12px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: '#fff',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: isLightTheme ? '2px' : '22px',
                                    transition: 'left 0.3s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }} />
                            </div>
                        </div>

                        {/* Notifications Toggle (New) */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid #374151',
                            paddingTop: '16px'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Notifications</span>
                            <div
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                style={{
                                    width: '44px',
                                    height: '24px',
                                    backgroundColor: !notificationsEnabled ? '#ccc' : '#2dd4bf',
                                    borderRadius: '12px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: '#fff',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: !notificationsEnabled ? '2px' : '22px',
                                    transition: 'left 0.3s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }} />
                            </div>
                        </div>
                    </div>
                )}

                <Tooltip title="Logout" placement="right">
                    <IconButton sx={{ ...iconStyle, color: isLightTheme ? '#d32f2f' : '#ef5350' }} onClick={handleLogout}>
                        <LogoutIcon fontSize="medium" />
                    </IconButton>
                </Tooltip>
            </div>

            {/* Profile Popup Card - Moved to root level for bottom alignment */}
            {showPopup && (
                <div
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    style={{
                        position: 'absolute',
                        left: '65px', // Sidebar width (60px) + gap (5px)
                        bottom: '20px', // Align with bottom padding
                        width: '300px',
                        backgroundColor: '#1f2937', // Forced Dark Mode
                        borderRadius: '0px',
                        boxShadow: '5px 0 15px rgba(0,0,0,0.3)',
                        zIndex: 50,
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', // Forced White Text
                        cursor: 'default',
                        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        transformOrigin: 'bottom left'
                    }}
                >
                    <style>
                        {`
                            @keyframes slideIn {
                                from {
                                    opacity: 0;
                                    transform: translateX(-30px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateX(0);
                                }
                            }
                        `}
                    </style>
                    {/* Header: Photo + Basic Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: '#0d9488',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#fff'
                            }}>
                                {(currentUser?.name?.[0] || currentUser?.email?.[0] || "U").toUpperCase()}
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#44b700',
                                borderRadius: '50%',
                                border: '2px solid #1f2937'
                            }} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {currentUser?.name || "User"}
                            </div>
                            <div style={{ fontSize: '14px', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {currentUser?.email || "user@example.com"}
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', opacity: 0.8 }}>About</label>
                        <textarea
                            value={aboutText}
                            onChange={(e) => setAboutText(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                                backgroundColor: '#111827',
                                color: '#fff',
                                fontSize: '14px',
                                resize: 'none',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                            rows={3}
                        />
                    </div>

                    {/* Update Button */}
                    <button
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: '#2dd4bf',
                            color: '#000',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'opacity 0.2s',
                        }}
                        onMouseOver={(e) => e.target.style.opacity = '0.9'}
                        onMouseOut={(e) => e.target.style.opacity = '1'}
                    >
                        Update Profile
                    </button>
                    {/* Theme Toggle REMOVED from here */}
                </div>
            )}
        </div>
    );
};

export default Profile;
