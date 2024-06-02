import React from "react";
import HomePage from "./pages/home/HomePage";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import { Routes, Route } from "react-router-dom";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import RightPanel from "./components/common/RightPanel";
import Sidebar from "./components/common/Sidebar";

function App() {
  const userData = useSelector((state) => state.userData);
  return (
    <>
      <div className="flex p-5 justify-center">
        {userData && <Sidebar />}
        <Routes>
          <Route path="/" element={userData ? <HomePage /> : <Login />} />
          <Route path="/login" element={!userData ? <Login /> : <HomePage />} />
          <Route
            path="/signup"
            element={!userData ? <SignUp /> : <HomePage />}
          />
          <Route
            path="/notifications"
            element={userData ? <NotificationPage /> : <Login />}
          />
          <Route
            path="/profile/:username"
            element={userData ? <ProfilePage /> : <Login />}
          />
        </Routes>
        {userData && <RightPanel />}
        <Toaster />
      </div>
    </>
  );
}

export default App;
