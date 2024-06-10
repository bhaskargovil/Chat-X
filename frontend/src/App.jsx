import React from "react";
import HomePage from "./pages/home/HomePage";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import { Routes, Route } from "react-router-dom";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import RightPanel from "./components/common/RightPanel";
import Sidebar from "./components/common/Sidebar";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import SearchPage from "./pages/search/SearchPage";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/getcurrentuser", {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data.data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="flex p-5 justify-center">
        {authUser && <Sidebar />}
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Login />} />
          <Route path="/login" element={!authUser ? <Login /> : <HomePage />} />
          <Route
            path="/signup"
            element={!authUser ? <SignUp /> : <HomePage />}
          />
          <Route
            path="/notifications"
            element={authUser ? <NotificationPage /> : <Login />}
          />
          <Route
            path="/profile/:username"
            element={authUser ? <ProfilePage /> : <Login />}
          />
          <Route
            path="/search"
            element={authUser ? <SearchPage /> : <Login />}
          />
        </Routes>
        {authUser && <RightPanel />}
        <Toaster />
      </div>
    </>
  );
}

export default App;
