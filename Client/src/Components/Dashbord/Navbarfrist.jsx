import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/feature/auth/authThunx";
import {
  FiGrid,
  FiLayers,
  FiUsers,
  FiUser,
  FiBriefcase,
  FiHome,
  FiMessageSquare,
  FiCheckSquare,
  FiFileText,
  FiChevronDown,
  FiMenu,
  FiLogOut,
  FiX,
} from "react-icons/fi";

const Navbarfristn = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMutualFund, setOpenMutualFund] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const toggleMutualFund = () => {
    setOpenMutualFund(!openMutualFund);
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
    setOpenMutualFund(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="font-sans">
      {/* Blue Header - Original color */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-3 px-4">
        <div className="container mx-auto">
          <h1 className="text-white text-2xl font-medium">
            Vpfinancial{" "}
            <span className="text-red-600 bg-white px-1 rounded">Nest</span>
          </h1>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-2">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-gray-700 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-0 items-center">
              {/* Dashboard */}
              <Link
                to="/"
                className="flex flex-col items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-600 transition-all min-w-[100px]"
                onClick={closeAllDropdowns}
              >
                <FiGrid className="text-lg mb-1" />
                <span className="text-xs font-medium">Dashboard</span>
              </Link>

              {/* Masters Dropdown */}
              <div className="relative group">
                <button
                  className="flex flex-col items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-600 transition-all min-w-[100px]"
                  onClick={() => toggleDropdown("masters")}
                >
                  <FiLayers className="text-lg mb-1" />
                  <div className="flex items-center">
                    <span className="text-xs font-medium">Masters</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "masters" && (
                  <div className="absolute top-full left-0 mt-0 p-4 w-[600px] bg-white shadow-xl rounded-b-lg border border-gray-200 z-50">
                    <div className="grid grid-cols-3 gap-4">
                      {/* Task Master */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          TASK MASTER
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/composite"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Composite Task
                          </Link>
                          <Link
                            to="/marketing-task"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Marketing Task
                          </Link>
                          <Link
                            to="/servicing-task"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Servicing Task
                          </Link>
                        </div>
                      </div>

                      {/* Location Master */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          LOCATION MASTER
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/area"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Add Location
                          </Link>
                          <Link
                            to="/sub-area"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Add Sub Location
                          </Link>
                        </div>
                      </div>

                      {/* Lead Master */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          LEAD MASTER
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/lead-type"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Lead Source
                          </Link>
                          <Link
                            to="/lead-source"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Lead Name
                          </Link>
                          <Link
                            to="/lead-occupation"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Lead Occupation
                          </Link>
                          <Link
                            to="/occupation-type"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Occupation Type
                          </Link>
                        </div>
                      </div>

                      {/* KYC Document */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          KYC Document
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/kycdocument"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Document Type
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Customers Dropdown */}
              <div className="relative group">
                <button
                  className="flex flex-col items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-600 transition-all min-w-[100px]"
                  onClick={() => toggleDropdown("customers")}
                >
                  <FiLayers className="text-lg mb-1" />
                  <div className="flex items-center">
                    <span className="text-xs font-medium">Customers</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "customers" && (
                  <div className="absolute top-full left-0 mt-0 p-4 w-[600px] bg-white shadow-xl rounded-b-lg border border-gray-200 z-50">
                    <div className="grid grid-cols-3 gap-4">
                      {/* Suspect */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          Suspect
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/suspect/add"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Add Suspect
                          </Link>
                          <Link
                            to="/suspect"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Suspect List
                          </Link>
                          <Link
                            to="/import-lead"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Import Lead
                          </Link>
                        </div>
                      </div>

                      {/* Prospect */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          Prospect
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/prospect/add"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Add Prospect
                          </Link>
                          <Link
                            to="/prospect"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Prospect List
                          </Link>
                        </div>
                      </div>

                      {/* Client */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          Client
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/client/add"
                            state={{ tab: "add" }}
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Add Client
                          </Link>
                          <Link
                            to="/client"
                            state={{ tab: "display" }}
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Client List
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Employee Dropdown */}
              <div className="relative group">
                <button
                  className="flex flex-col items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-600 transition-all min-w-[100px]"
                  onClick={() => toggleDropdown("employee")}
                >
                  <FiUsers className="text-lg mb-1" />
                  <div className="flex items-center">
                    <span className="text-xs font-medium">Employee</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "employee" && (
                  <div className="absolute top-full left-0 mt-0 p-4 w-[900px] bg-white shadow-xl rounded-b-lg border border-gray-200 z-50">
                    <div className="grid grid-cols-4 gap-4">
                      {/* Office Admin */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          Office Admin
                        </h6>
                        <div className="space-y-1">
                          {[
                            {
                              name: "Job Profile & Target",
                              to: "/job-profile-target-admin",
                            },
                            {
                              name: "Employee Recruitment",
                              to: "/employee-recruitment",
                            },
                            { name: "Vacancy Notice", to: "/vacancy-notice" },
                            { name: "Add Candidate", to: "/addcandidate" },
                            { name: "Career Enquiry", to: "/career-enquiry" },
                            {
                              name: "Resume Shortlist",
                              to: "/resume-shortlist",
                            },
                            {
                              name: "Interview Process",
                              to: "/interview-process",
                            },
                            {
                              name: "Internship Candidate",
                              to: "/internship-candidate",
                            },
                            { name: "Add Employee", to: "/add-employee" },
                            { name: "Joining Data", to: "/joining-data" },
                            {
                              name: "Show Appointments",
                              to: "/job-profile-target-admin",
                            },
                          ].map((item, idx) => (
                            <Link
                              key={idx}
                              to={item.to}
                              className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded truncate"
                              onClick={closeAllDropdowns}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Telecaller */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          Telecaller
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/job-profile-target-telecaller"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Job Profile & Target
                          </Link>
                        </div>

                        <h6 className="text-red-600 text-xs font-semibold mb-2 mt-3">
                          Telemarketer
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/job-profile-target-telemarketer"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Job Profile & Target
                          </Link>
                        </div>

                        <h6 className="text-red-600 text-xs font-semibold mb-2 mt-3">
                          CRE
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/job-profile-target-cre"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Job Profile & Target
                          </Link>
                        </div>
                      </div>

                      {/* Office Executive */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          Office Executive
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/job-profile-target-office-executive"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Job Profile & Target
                          </Link>
                        </div>

                        <h6 className="text-red-600 text-xs font-semibold mb-2 mt-3">
                          HR Rules
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/hr-rules"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            HR Rules & Regulations
                          </Link>
                          <Link
                            to="/employee-training"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Employee Training
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Departments Dropdown */}
              <div className="relative group">
                <button
                  className="flex flex-col items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-600 transition-all min-w-[120px]"
                  onClick={() => toggleDropdown("departments")}
                >
                  <FiBriefcase className="text-lg mb-1" />
                  <div className="flex items-center">
                    <span className="text-xs font-medium">Departments</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "departments" && (
                  <div className="absolute top-full left-0 mt-0 p-4 w-[800px] bg-white shadow-xl rounded-b-lg border border-gray-200 z-50">
                    <div className="grid grid-cols-4 gap-4">
                      {/* HR Department */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          HR Department
                        </h6>
                        <div className="space-y-1">
                          {[{ name: "All Employees", to: "/add-employee" }].map(
                            (item, idx) => (
                              <Link
                                key={idx}
                                to={item.to}
                                className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded truncate"
                                onClick={closeAllDropdowns}
                              >
                                {item.name}
                              </Link>
                            )
                          )}
                        </div>
                      </div>

                      {/* Account Department */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          Account Department
                        </h6>
                        <div className="space-y-1">
                          {[
                            { name: "Income Head", to: "/income-head" },
                            { name: "Expenses Head", to: "/expenses-head" },
                            { name: "Salary & Wages", to: "/salary-wages" },
                            { name: "Incentives", to: "/incentives" },
                            { name: "Office Purchase", to: "/office-purchase" },
                            {
                              name: "Utility Expenses",
                              to: "/utility-expenses",
                            },
                            { name: "Loss & Discount", to: "/loss-discount" },
                            {
                              name: "Promotional Expenses",
                              to: "/promotional-expenses",
                            },
                          ].map((item, idx) => (
                            <Link
                              key={idx}
                              to={item.to}
                              className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded truncate"
                              onClick={closeAllDropdowns}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Marketing Department */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          Marketing Department
                        </h6>
                        <div className="space-y-1">
                          {[
                            {
                              name: "Composite Data",
                              to: "/marketing-composite",
                            },
                            { name: "Life Insurance", to: "/marketing-life" },
                            {
                              name: "Health Insurance",
                              to: "/marketing-health",
                            },
                            { name: "Mutual Fund", to: "/marketing-mutual" },
                            {
                              name: "Real Estate",
                              to: "/marketing-realestate",
                            },
                          ].map((item, idx) => (
                            <Link
                              key={idx}
                              to={item.to}
                              className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded truncate"
                              onClick={closeAllDropdowns}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Servicing Department + CRM */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          Servicing Department
                        </h6>
                        <div className="space-y-1">
                          {[
                            {
                              name: "Composite Data",
                              to: "/servicing-composite",
                            },
                            { name: "Life Insurance", to: "/servicing-life" },
                            {
                              name: "Health Insurance",
                              to: "/servicing-health",
                            },
                            { name: "Mutual Fund", to: "/servicing-mutual" },
                            {
                              name: "Real Estate",
                              to: "/servicing-realestate",
                            },
                          ].map((item, idx) => (
                            <Link
                              key={idx}
                              to={item.to}
                              className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded truncate"
                              onClick={closeAllDropdowns}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>

                        <h6 className="text-red-600 text-xs font-semibold mb-2 mt-3">
                          RM
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/crm-department"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            RM Department
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Office Dropdown */}
              <div className="relative group">
                <button
                  className="flex flex-col items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-600 transition-all min-w-[100px]"
                  onClick={() => toggleDropdown("office")}
                >
                  <FiHome className="text-lg mb-1" />
                  <div className="flex items-center">
                    <span className="text-xs font-medium">Office</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "office" && (
                  <div className="absolute top-full left-0 mt-0 p-4 w-[600px] bg-white shadow-xl rounded-b-lg border border-gray-200 z-50">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Financial */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          FINANCIAL
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/financial-product-list"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Financial Product List
                          </Link>
                          <Link
                            to="/company-name"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Company Name
                          </Link>

                          {/* Mutual Fund Submenu */}
                          <div className="relative">
                            <div className="ml-4 mt-1 space-y-1">
                              <Link
                                to="/mutual-fund/registrar"
                                className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                                onClick={closeAllDropdowns}
                              >
                                MF Registrar
                              </Link>
                              <Link
                                to="/mutual-fund/amc"
                                className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                                onClick={closeAllDropdowns}
                              >
                                MF AMC Name
                              </Link>
                            </div>
                          </div>

                          <Link
                            to="/other-product"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Other Product
                          </Link>
                        </div>
                      </div>

                      {/* Office Records */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          OFFICE RECORDS
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/office-diary"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Office Diary
                          </Link>
                          <Link
                            to="/office-purchase"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Office Purchase
                          </Link>
                          <Link
                            to="/important-documents"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Important Documents
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CRM Dropdown */}
              <div className="relative group">
                <button
                  className="flex flex-col items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-600 transition-all min-w-[100px]"
                  onClick={() => toggleDropdown("crm")}
                >
                  <FiMessageSquare className="text-lg mb-1" />
                  <div className="flex items-center">
                    <span className="text-xs font-medium">RM</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "crm" && (
                  <div className="absolute top-full left-0 mt-0 p-4 w-[400px] bg-white shadow-xl rounded-b-lg border border-gray-200 z-50">
                    <div className="grid grid-cols-2 gap-4">
                      {/* CRM Records */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          CRM RECORDS
                        </h6>
                        <div className="space-y-1">
                          {[
                            "Relationship",
                            "Employee",
                            "Customer",
                            "Associates",
                          ].map((item) => (
                            <Link
                              key={item}
                              to={`/crm-${item.toLowerCase()}`}
                              className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                              onClick={closeAllDropdowns}
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* CRM Activities */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          CRM ACTIVITIES
                        </h6>
                        <div className="space-y-1">
                          {[
                            "Creative Activity",
                            "Advertisement",
                            "Composite Data",
                          ].map((item) => (
                            <Link
                              key={item}
                              to={`/crm-${item
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                              className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                              onClick={closeAllDropdowns}
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* CRM Insurance & Funds */}
                      <div className="col-span-2">
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          CRM INSURANCE & FUNDS
                        </h6>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Life Insurance",
                            "Health Insurance",
                            "Mutual Fund",
                            "Real Estate",
                          ].map((item) => (
                            <Link
                              key={item}
                              to={`/crm-${item
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                              className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                              onClick={closeAllDropdowns}
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Task Dropdown */}
              <div className="relative group">
                <button
                  className="flex flex-col items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-600 transition-all min-w-[100px]"
                  onClick={() => toggleDropdown("task")}
                >
                  <FiCheckSquare className="text-lg mb-1" />
                  <div className="flex items-center">
                    <span className="text-xs font-medium">Task</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "task" && (
                  <div className="absolute top-full left-0 mt-0 p-4 w-[400px] bg-white shadow-xl rounded-b-lg border border-gray-200 z-50">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Task Categories */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          TASK CATEGORIES
                        </h6>
                        <div className="space-y-1">
                          {["Composite", "Marketing", "Servicing"].map(
                            (item) => (
                              <Link
                                key={item}
                                to={`/task-${item.toLowerCase()}`}
                                className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                                onClick={closeAllDropdowns}
                              >
                                {item}
                              </Link>
                            )
                          )}
                        </div>
                      </div>

                      {/* Task Assign */}
                      <div>
                        <h6 className="text-red-600 text-xs font-semibold mb-2">
                          Task Assign
                        </h6>
                        <div className="space-y-1">
                          <Link
                            to="/task-assign"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Assign Task
                          </Link>
                          <Link
                            to="/appointment-assign"
                            className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                            onClick={closeAllDropdowns}
                          >
                            Assign Appointments
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reports Dropdown */}
              <div className="relative group">
                <button
                  className="flex flex-col items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-600 transition-all min-w-[100px]"
                  onClick={() => toggleDropdown("reports")}
                >
                  <FiFileText className="text-lg mb-1" />
                  <div className="flex items-center">
                    <span className="text-xs font-medium">Reports</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "reports" && (
                  <div className="absolute top-full left-0 mt-0 p-4 w-[300px] bg-white shadow-xl rounded-b-lg border border-gray-200 z-50">
                    <div>
                      <h6 className="text-red-600 text-xs font-semibold mb-2">
                        REPORTS
                      </h6>
                      <div className="space-y-1">
                        <Link
                          to="/financial-product-list"
                          className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                          onClick={closeAllDropdowns}
                        >
                          Financial Reports
                        </Link>
                        <Link
                          to="/report-2"
                          className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                          onClick={closeAllDropdowns}
                        >
                          Sales Reports
                        </Link>
                        <Link
                          to="/report-3"
                          className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                          onClick={closeAllDropdowns}
                        >
                          Customer Reports
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <div className="space-y-2">
                {/* Mobile menu items will be added similarly */}
                <div className="text-center text-gray-600 py-2">
                  Mobile menu - Add items as needed
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbarfristn;
