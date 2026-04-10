import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import SelectInstitute from "../pages/SelectInstitute";
import SelectRole from "../pages/SelectRole";
import Dashboard from "../pages/Dashboard";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/institute-selection" element={<SelectInstitute />} />
        <Route path="/role-selection" element={<SelectRole />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;