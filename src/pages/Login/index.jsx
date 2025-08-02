import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useThemeContext } from '../../ThemeContext';

const LoginSignup = () => {
    const [tab, setTab] = useState(0);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState("");

    const handleTabChange = (e, newValue) => setTab(newValue);

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });

    // const handleLogin = (e) => {
    //     e.preventDefault();
    //     alert(`Login with: ${loginData.email} / ${loginData.password}`);
    // };
    // const handleSignup = (e) => {
    //     e.preventDefault();
    //     alert(`Signup with: ${signupData.name} / ${signupData.email} / ${signupData.password}`);
    // };

    const navigate = useNavigate();

    const register = (event) => {
        event.preventDefault();
        setError("");
        // Your table columns are username, email, password
        const { username, email, password } = signupData;
        axios.post("http://localhost:5000/register", { username, email, password })
            .then(res => {
                // Accept 201 as success, even if no explicit success flag
                if (res.data.success || res.data.status === 'success' || res.status === 201) {
                    alert(res.data.message || "Registration successful");
                    setTab(0); // Switch to login tab
                } else {
                    setError(res.data.message || "Registration failed");
                }
            })
            .catch(err => {
                setError(err.response?.data?.message || "Registration failed");
            });
    };

    const login = (event) => {
        event.preventDefault();
        setError("");
        axios.post("http://localhost:5000/login", loginData)
            .then(res => {
                // Accept login if status is 200 and message is 'Login successful'
                if (res.status === 200 && res.data.message === "Login successful") {
                    // Save current user info to localStorage (assuming res.data.user is returned)
                    if (res.data.user) {
                        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
                    }
                    navigate("/ChatWindow");
                } else {
                    setError(res.data.message || "Login failed");
                }
            })
            .catch(err => {
                setError(err.response?.data?.message || "Your email or password is wrong. Try again.");
            });
    };

    const { isLightTheme } = useThemeContext();
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: isLightTheme ? '#fff' : '#15161a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, minWidth: 340, maxWidth: 380, bgcolor: isLightTheme ? '#fff' : '#414142', border: '2px solid #fff' }}>
                <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
                    <Tab label="Login" />
                    <Tab label="Signup" />
                </Tabs>
                {error && (
                    <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>
                )}
                {tab === 0 && (
                    <form onSubmit={login}>
                        <TextField
                            label="Email"
                            name="email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ style: { color: isLightTheme ? '#222' : '#fff' } }}
                            inputProps={{ style: { color: isLightTheme ? '#222' : '#fff' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                    '&:hover fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                    '&.Mui-focused fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                },
                            }}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ style: { color: isLightTheme ? '#222' : '#fff' } }}
                            inputProps={{ style: { color: isLightTheme ? '#222' : '#fff' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                    '&:hover fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                    '&.Mui-focused fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                },
                            }}
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
                    </form>
                )}
                {tab === 1 && (
                    <form onSubmit={register}>
                        <TextField
                            label="Username"
                            name="username"
                            value={signupData.username}
                            onChange={handleSignupChange}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ style: { color: isLightTheme ? '#222' : '#fff' } }}
                            inputProps={{ style: { color: isLightTheme ? '#222' : '#fff' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                    '&:hover fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                    '&.Mui-focused fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                },
                            }}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={signupData.email}
                            onChange={handleSignupChange}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ style: { color: isLightTheme ? '#222' : '#fff' } }}
                            inputProps={{ style: { color: isLightTheme ? '#222' : '#fff' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                    '&:hover fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                    '&.Mui-focused fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                },
                            }}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={signupData.password}
                            onChange={handleSignupChange}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ style: { color: isLightTheme ? '#222' : '#fff' } }}
                            inputProps={{ style: { color: isLightTheme ? '#222' : '#fff' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                    '&:hover fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                    '&.Mui-focused fieldset': { borderColor: isLightTheme ? '#222' : '#fff' },
                                },
                            }}
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Signup</Button>
                    </form>
                )}
            </Paper>
        </Box>
    );
};

export default LoginSignup;
