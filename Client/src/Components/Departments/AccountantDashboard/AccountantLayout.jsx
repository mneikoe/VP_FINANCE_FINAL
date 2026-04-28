import React, { useState } from "react";
import { Outlet, Link, useNavigate, Navigate } from "react-router-dom";
import {
  FiGrid,
  FiDollarSign,
  FiCreditCard,
  FiShoppingCart,
  FiFileText,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";
import { Landmark } from "lucide-react";

const AccountantLayout = () => {

  // Logout
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user || user.role !== "Accountant") {
    return <Navigate to="/auth/login" replace />;
  }


  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  const toggle = (name) => setOpen(open === name ? null : name);
  const close = () => setOpen(null);

  const handleLogout = () => {
    localStorage.clear();

    // hard redirect
    window.location.href = "/auth/login";
  };

  const navBtn =
    "flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-600 transition";

  return (
    <div>
      {/* 🔵 Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3">
        <h1 className="text-white text-xl font-semibold">
          Accountant Dashboard
        </h1>
      </div>

      {/* 🔝 Navbar */}
      <nav className="bg-white shadow border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center">
            <button onClick={() => navigate("/accountant/dashboard")} className={navBtn}>
              <FiGrid /> Dashboard
            </button>

            <button onClick={() => navigate("/accountant/banks")} className={navBtn +"flex"}>
              <Landmark /> Transaction Master
            </button>

            <button onClick={() => navigate("/accountant/income-head")} className={navBtn}>
              <FiDollarSign /> Income
            </button>

            <button onClick={() => navigate("/accountant/expenses-head")} className={navBtn}>
              <FiCreditCard /> Expenses
            </button>

            <button onClick={() => navigate("/accountant/office-purchase")} className={navBtn}>
              <FiShoppingCart /> Purchase
            </button>

            {/* Reports Dropdown */}
            <div className="relative">
              <button onClick={() => toggle("reports")} className={navBtn}>
                <FiFileText /> Reports <FiChevronDown />
              </button>

              {open === "reports" && (
                <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2 w-48 z-50">
                  <Link
                    to="/accountant/reports"
                    onClick={close}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded"
                  >
                    Financial Reports
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="p-6 bg-gray-100 min-h-screen accountant-layout">
        <Outlet />
      </div>
    </div>
  );
};

export default AccountantLayout;