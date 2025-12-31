import React, { useState, useEffect } from "react";
import { useThemeContext } from '../ThemeContext';
// Keep Dialog components for functionality
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Typography
} from "@mui/material";


const SideBar = ({ refreshTrigger, currentUser, onSelectChat, socket, hiddenUsers }) => {
  const { isLightTheme } = useThemeContext();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);

  // Socket logic
  useEffect(() => {
    if (!socket) return;

    // Fix: check for _id or id
    const userId = currentUser?._id || currentUser?.id;
    socket.emit('getUsers', { excludeId: userId });

    const handleUsersList = (data) => {
      console.log('Received usersList from backend:', data);
      setChats(data);
    };

    socket.on('usersList', handleUsersList);

    return () => {
      socket.off('usersList', handleUsersList);
    };
  }, [refreshTrigger, currentUser, socket]);

  const filteredChats = chats.filter((chat) =>
    (chat.username || chat.name || "").toLowerCase().includes(search.toLowerCase()) &&
    (!hiddenUsers || !hiddenUsers.has(chat.id))
  );

  // Logout logic
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    sessionStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  return (
    <div className={`flex flex-col h-full w-80 shrink-0 overflow-hidden border-r border-white/20 relative shadow-2xl transition-colors duration-500
            ${isLightTheme ? 'bg-backgroundColor' : 'bg-gray-900'} `}>

      {/* Vintage Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-vintage-pattern"></div>

      {/* Header Section */}
      <div className="relative z-10 p-4 pb-2 flex flex-col gap-4">


        {/* Search Bar - Rectangular Minimal */}
        <div className="relative group animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-white/50 group-focus-within:text-white transition-colors" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="block w-full pl-10 pr-3 py-2 border-b-2 border-white/10 bg-transparent text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-all duration-300 sm:text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex p-1  rounded-full w-full relative animate-slide-in-left backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setTab(0)}
            className={`flex-1 py-1.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 relative z-10 
                            ${tab === 0
                ? 'bg-white/20 backdrop-blur-md text-white shadow-lg border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            Chats
          </button>
          <button
            onClick={() => setTab(1)}
            className={`flex-1 py-1.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 relative z-10
                            ${tab === 1
                ? 'bg-white/20 backdrop-blur-md text-white shadow-lg border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* List Section */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {tab === 0 && (
          <div className="flex flex-col gap-2">
            {filteredChats.map((chat, idx) => (
              <React.Fragment key={chat.id || chat.username}>
                <div
                  onClick={() => onSelectChat && onSelectChat(chat)}
                  className={`group flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 hover:bg-white/5
                                      border-l-4 border-transparent hover:border-brightColor`}
                  style={{ animationDelay: `${0.3 + (idx * 0.05)}s` }}
                >
                  <div className="relative">
                    <Avatar
                      sx={{
                        bgcolor: isLightTheme ? '#2dd4bf' : '#0d9488',
                        width: 40,
                        height: 40,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      className="transition-transform group-hover:rotate-6 duration-300"
                    >
                      {(chat.username || chat.name || "U")[0]}
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography variant="subtitle1" fontWeight="500" className="truncate text-white" style={{ fontSize: '15px' }}>
                      {chat.username || chat.name}
                    </Typography>
                  </div>
                </div>
                {/* Horizontal Separator - not touching edges (mx-4) */}
                {idx < filteredChats.length - 1 && (
                  <div className={`h-[1px] mx-4 ${isLightTheme ? 'bg-gray-200' : 'bg-white/10'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {tab === 1 && (
          <div className="text-center p-8 opacity-60 text-white animate-fade-in">
            <Typography variant="body1">No groups yet.</Typography>
          </div>
        )}
      </div>



      {/* Logout Dialog (Reuse existing structure but minimal styling) */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 1,
            minWidth: 320
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Logout?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to leave?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} variant="contained" sx={{ bgcolor: '#00d2d3', '&:hover': { bgcolor: '#2dd4bf' }, borderRadius: 2 }}>Logout</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
export default SideBar;
