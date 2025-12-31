
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './ThemeContext';
import ChatWindow from "./components/ChatWindow";
import Authentication from "./pages/Authentication";
import Profile from "./components/Profile";


function App() {
  // Always get current user from sessionStorage on every render
  const getCurrentUser = () => {
    const user = sessionStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  };
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // No storage listener needed for sessionStorage as tabs are isolated

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Authentication />} />
          <Route path='/login' element={<Authentication />} />
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