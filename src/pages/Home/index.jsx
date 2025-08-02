import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../ThemeContext';

const Home = () => {
    const navigate = useNavigate();
    const { isLightTheme } = useThemeContext();
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: isLightTheme ? '#fff' : '#15161a' }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>Hive Chat</Typography>
            <Typography variant="h6" sx={{ mb: 4, color: isLightTheme ? '#15161a' : '#e8e9ed' }}>Welcome! Please login or sign up to continue.</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" onClick={() => navigate('/login')}>Login / Signup</Button>
            </Box>
        </Box>
    );
};

export default Home;
