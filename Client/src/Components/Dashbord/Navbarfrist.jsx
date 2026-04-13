import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const closeDropdownTimerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  const navItemClass =
    "group flex h-16 min-w-[98px] cursor-pointer flex-col items-center justify-center rounded-lg px-3 text-gray-600 transition-all duration-200 ease-in-out hover:bg-gray-100 hover:text-blue-600";
  const activeNavClass = "bg-blue-50 text-blue-600";
  const iconClass = "mb-1 text-[18px]";
  const labelClass = "text-sm font-medium tracking-wide";

  const isPathActive = (paths = []) =>
    paths.some((path) =>
      path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)
    );

  const handleDropdownEnter = (name) => {
    if (closeDropdownTimerRef.current) {
      clearTimeout(closeDropdownTimerRef.current);
    }
    setOpenDropdown(name);
  };

  const handleDropdownClick = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleDropdownLeave = () => {
    closeDropdownTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    return () => {
      if (closeDropdownTimerRef.current) {
        clearTimeout(closeDropdownTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="font-sans" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto w-full max-w-[1600px] px-3 lg:px-5">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-gray-700 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

              <Link
                to="/"
                onClick={closeAllDropdowns}
                className="rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-xl font-bold tracking-wide text-white transition-all duration-200 ease-in-out hover:scale-[1.01]"
              >
                Vpfinancial <span className="text-red-200">Nest</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden flex-1 lg:flex lg:items-center lg:justify-center lg:gap-1 xl:gap-2">
              {/* Dashboard */}
              <Link
                to="/"
                className={`${navItemClass} ${
                  isPathActive(["/"]) ? activeNavClass : ""
                }`}
                onClick={closeAllDropdowns}
              >
                <FiGrid className={iconClass} />
                <span className={labelClass}>Dashboard</span>
              </Link>

              {/* Masters Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("masters")}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={`${navItemClass} ${
                    openDropdown === "masters" ? activeNavClass : ""
                  }`}
                  onClick={() => handleDropdownClick("masters")}
                >
                  <FiLayers className={iconClass} />
                  <div className="flex items-center">
                    <span className={labelClass}>Masters</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "masters" && (
                  <div className="absolute left-0 top-full z-50 mt-0 w-[680px] rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out">
                    <div className="grid grid-cols-3 gap-5">
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
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("customers")}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={`${navItemClass} ${
                    openDropdown === "customers" ? activeNavClass : ""
                  }`}
                  onClick={() => handleDropdownClick("customers")}
                >
                  <FiLayers className={iconClass} />
                  <div className="flex items-center">
                    <span className={labelClass}>Customers</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "customers" && (
                  <div className="absolute left-0 top-full z-50 mt-0 w-[680px] rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out">
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
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("employee")}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={`${navItemClass} ${
                    openDropdown === "employee" ? activeNavClass : ""
                  }`}
                  onClick={() => handleDropdownClick("employee")}
                >
                  <FiUsers className={iconClass} />
                  <div className="flex items-center">
                    <span className={labelClass}>Employee</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "employee" && (
                  <div className="absolute left-0 top-full z-50 mt-0 w-[980px] rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out">
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
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("departments")}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={`${navItemClass} ${
                    openDropdown === "departments" ? activeNavClass : ""
                  }`}
                  onClick={() => handleDropdownClick("departments")}
                >
                  <FiBriefcase className={iconClass} />
                  <div className="flex items-center">
                    <span className={labelClass}>Departments</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "departments" && (
                  <div className="absolute left-0 top-full z-50 mt-0 w-[920px] rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out">
                    <div className="grid grid-cols-4 gap-4">
                     

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

                       
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Office Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("office")}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={`${navItemClass} ${
                    openDropdown === "office" ? activeNavClass : ""
                  }`}
                  onClick={() => handleDropdownClick("office")}
                >
                  <FiHome className={iconClass} />
                  <div className="flex items-center">
                    <span className={labelClass}>Office</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "office" && (
                  <div className="absolute left-0 top-full z-50 mt-0 w-[680px] rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out">
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
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("crm")}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={`${navItemClass} ${
                    openDropdown === "crm" ? activeNavClass : ""
                  }`}
                  onClick={() => handleDropdownClick("crm")}
                >
                  <FiMessageSquare className={iconClass} />
                  <div className="flex items-center">
                    <span className={labelClass}>RM</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "crm" && (
                  <div className="absolute left-0 top-full z-50 mt-0 w-[440px] rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out">
                    <div className="grid grid-cols-2 gap-4">
                      {/* CRM Records */}
                      {/* <div>
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
                      </div> */}

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
                      {/* <div className="col-span-2">
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
                      </div> */}
                    </div>
                  </div>
                )}
              </div>

              {/* Task Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("task")}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={`${navItemClass} ${
                    openDropdown === "task" ? activeNavClass : ""
                  }`}
                  onClick={() => handleDropdownClick("task")}
                >
                  <FiCheckSquare className={iconClass} />
                  <div className="flex items-center">
                    <span className={labelClass}>Task</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "task" && (
                  <div className="absolute left-0 top-full z-50 mt-0 w-[440px] rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out">
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
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("reports")}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={`${navItemClass} ${
                    openDropdown === "reports" ? activeNavClass : ""
                  }`}
                  onClick={() => handleDropdownClick("reports")}
                >
                  <FiFileText className={iconClass} />
                  <div className="flex items-center">
                    <span className={labelClass}>Reports</span>
                    <FiChevronDown className="ml-1 text-xs" />
                  </div>
                </button>

                {openDropdown === "reports" && (
                  <div className="absolute left-0 top-full z-50 mt-0 w-[340px] rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out">
                    <div>
                      <h6 className="text-red-600 text-xs font-semibold mb-2">
                        REPORTS
                      </h6>
                      <div className="space-y-1">
                        <Link
                          to="/reports/employee-report"
                          className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                          onClick={closeAllDropdowns}
                        >
                          Employee Report
                        </Link>
                        <Link
                          to="/reports/telecaller-report"
                          className="block text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
                          onClick={closeAllDropdowns}
                        >
                          Telecaller Calling Report
                        </Link>
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
              className="flex h-9 items-center rounded-md border border-red-500 px-3 text-xs font-medium text-red-600 transition-all duration-200 ease-in-out hover:bg-red-50"
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
