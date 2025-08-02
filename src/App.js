
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './ThemeContext';
import Home from './pages/Home';
import LoginSignup from './pages/Login';
import ChatWindow from "./components/ChatWindow";


function App() {
  // Always get current user from localStorage on every render (to support multiple windows)
  const getCurrentUser = () => {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  };
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Listen for storage changes (other tabs/windows login/logout)
  useEffect(() => {
    const handleStorage = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<LoginSignup />} />
          <Route
            path='/ChatWindow'
            element={<ChatWindow currentUser={currentUser} />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;