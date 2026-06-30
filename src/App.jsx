import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import JoinQueue from "./pages/JoinQueue";
import MyStatus from "./pages/MyStatus";
import PublicQueue from "./pages/PublicQueue";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-charcoal-950">
        <Routes>
          <Route path="/" element={<JoinQueue />} />
          <Route path="/status/:id" element={<MyStatus />} />
          <Route path="/queue" element={<PublicQueue />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}