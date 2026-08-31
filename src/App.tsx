import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import ProfilePage from "./pages/profile";
import ChatPage from "./pages/chat";
import ProtectedRoute from "./components/ProtectedRoute";
import DMPage from "./pages/dm";
import Landing from "./pages/landing";
import { AnimatePresence } from "framer-motion";
import { CallProvider } from "./context/CallContext";
import IncomingCallOverlay from "./components/chat/IncomingCallOverlay";

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dm"
          element={
            <ProtectedRoute>
              <DMPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CallProvider>
        <AnimatedRoutes />
        <IncomingCallOverlay />
      </CallProvider>
    </BrowserRouter>
  );
}

export default App;
