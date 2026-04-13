import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/feature/auth/authThunx";
import {
  FiGrid,
  FiLayers,
  FiUsers,
  FiBriefcase,
  FiHome,
  FiMessageSquare,
  FiCheckSquare,
  FiFileText,
  FiChevronDown,
  FiMenu,
  FiLogOut,
  FiX,
  FiUser,
  FiSettings,
  FiBarChart2,
  FiDatabase,
  FiTarget,
} from "react-icons/fi";
import {
  DashboardOutlined,
  DatabaseOutlined,
  TeamOutlined,
  UserOutlined,
  AppstoreOutlined,
  HomeOutlined,
  MessageOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  DownOutlined,
  SettingOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const Navbarfristn = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const closeDropdownTimerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

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
    }, 150);
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

  // Navigation Item Component
  const NavItem = ({ to, icon: Icon, label, active, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative flex h-14 min-w-[90px] cursor-pointer flex-col items-center justify-center 
        rounded-lg px-3 transition-all duration-200 ease-in-out
        ${active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}
        group
      `}
    >
      <Icon className="mb-1 text-lg transition-transform duration-200 group-hover:scale-110" />
      <span className="text-xs font-medium tracking-wide">{label}</span>
      {active && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-blue-600" />
      )}
    </Link>
  );

  // Dropdown Item Component
  const DropdownNavItem = ({ icon: Icon, label, isOpen, onClick, children }) => (
    <div
      className="relative"
      onMouseEnter={() => handleDropdownEnter(label.toLowerCase())}
      onMouseLeave={handleDropdownLeave}
    >
      <button
        type="button"
        onClick={onClick}
        className={`
          relative flex h-14 min-w-[90px] cursor-pointer flex-col items-center justify-center 
          rounded-lg px-3 transition-all duration-200 ease-in-out
          ${isOpen ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}
          group w-full
        `}
      >
        <Icon className="mb-1 text-lg transition-transform duration-200 group-hover:scale-110" />
        <div className="flex items-center">
          <span className="text-xs font-medium tracking-wide">{label}</span>
          <FiChevronDown
            className={`ml-1 text-xs transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
        {isOpen && (
          <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-blue-600" />
        )}
      </button>
      {children}
    </div>
  );

  // Dropdown Menu Component
  const DropdownMenu = ({ isOpen, width = "680px", children }) => (
    <div
      className={`
        absolute left-0 top-full z-50 mt-1 rounded-xl border border-gray-200 
        bg-white shadow-xl transition-all duration-200 ease-in-out
        ${isOpen ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-2"}
      `}
      style={{ width }}
    >
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-5">{children}</div>
    </div>
  );

  // Menu Section Component
  const MenuSection = ({ title, items }) => (
    <div>
      <h6 className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">
        {title}
      </h6>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-all duration-150 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1"
            onClick={closeAllDropdowns}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="font-sans" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top accent bar with gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500" />

      <nav
        className={`
          sticky top-0 z-50 border-b border-gray-200 bg-white
          transition-shadow duration-300
          ${scrolled ? "shadow-lg" : "shadow-sm"}
        `}
      >
        <div className="mx-auto w-full max-w-[1800px] px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>

              <Link
                to="/"
                onClick={closeAllDropdowns}
                className="group flex items-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md transition-transform group-hover:scale-105">
                  <span className="text-xl font-bold text-white">VP</span>
                </div>
                <div className="hidden lg:block">
                  <div className="text-lg font-bold leading-tight text-gray-800">
                    VPFinancial
                  </div>
                  <div className="text-xs font-medium text-blue-600">Nest</div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden flex-1 lg:flex lg:items-center lg:justify-center lg:gap-1 xl:gap-3">
              {/* Dashboard */}
              <NavItem
                to="/"
                icon={FiGrid}
                label="Dashboard"
                active={isPathActive(["/"])}
                onClick={closeAllDropdowns}
              />

              {/* Masters Dropdown */}
              <DropdownNavItem
                icon={FiLayers}
                label="Masters"
                isOpen={openDropdown === "masters"}
                onClick={() => handleDropdownClick("masters")}
              >
                <DropdownMenu isOpen={openDropdown === "masters"} width="720px">
                  <div className="grid grid-cols-3 gap-6">
                    <MenuSection
                      title="Task Master"
                      items={[
                        { name: "Composite Task", to: "/composite" },
                        { name: "Marketing Task", to: "/marketing-task" },
                        { name: "Servicing Task", to: "/servicing-task" },
                      ]}
                    />
                    <MenuSection
                      title="Location Master"
                      items={[
                        { name: "Add Location", to: "/area" },
                        { name: "Add Sub Location", to: "/sub-area" },
                      ]}
                    />
                    <MenuSection
                      title="Lead Master"
                      items={[
                        { name: "Lead Source", to: "/lead-type" },
                        { name: "Lead Name", to: "/lead-source" },
                        { name: "Lead Occupation", to: "/lead-occupation" },
                        { name: "Occupation Type", to: "/occupation-type" },
                      ]}
                    />
                    <MenuSection
                      title="KYC Document"
                      items={[{ name: "Document Type", to: "/kycdocument" }]}
                    />
                  </div>
                </DropdownMenu>
              </DropdownNavItem>

              {/* Customers Dropdown */}
              <DropdownNavItem
                icon={FiUser}
                label="Customers"
                isOpen={openDropdown === "customers"}
                onClick={() => handleDropdownClick("customers")}
              >
                <DropdownMenu isOpen={openDropdown === "customers"} width="720px">
                  <div className="grid grid-cols-3 gap-6">
                    <MenuSection
                      title="Suspect"
                      items={[
                        { name: "Add Suspect", to: "/suspect/add" },
                        { name: "Suspect List", to: "/suspect" },
                        { name: "Import Lead", to: "/import-lead" },
                      ]}
                    />
                    <MenuSection
                      title="Prospect"
                      items={[
                        { name: "Add Prospect", to: "/prospect/add" },
                        { name: "Prospect List", to: "/prospect" },
                      ]}
                    />
                    <MenuSection
                      title="Client"
                      items={[
                        { name: "Add Client", to: "/client/add" },
                        { name: "Client List", to: "/client" },
                      ]}
                    />
                  </div>
                </DropdownMenu>
              </DropdownNavItem>

              {/* Employee Dropdown */}
              <DropdownNavItem
                icon={FiUsers}
                label="Employee"
                isOpen={openDropdown === "employee"}
                onClick={() => handleDropdownClick("employee")}
              >
                <DropdownMenu isOpen={openDropdown === "employee"} width="900px">
                  <div className="grid grid-cols-3 gap-6">
                    <MenuSection
                      title="Office Admin"
                      items={[
                        { name: "Job Profile & Target", to: "/job-profile-target-admin" },
                        { name: "Employee Recruitment", to: "/employee-recruitment" },
                        { name: "Vacancy Notice", to: "/vacancy-notice" },
                        { name: "Add Candidate", to: "/addcandidate" },
                        { name: "Career Enquiry", to: "/career-enquiry" },
                        { name: "Resume Shortlist", to: "/resume-shortlist" },
                        { name: "Interview Process", to: "/interview-process" },
                        { name: "Internship Candidate", to: "/internship-candidate" },
                        { name: "Add Employee", to: "/add-employee" },
                        { name: "Joining Data", to: "/joining-data" },
                      ]}
                    />
                    <div>
                      <MenuSection
                        title="Telecaller"
                        items={[
                          { name: "Job Profile & Target", to: "/job-profile-target-telecaller" },
                        ]}
                      />
                      <div className="mt-4">
                        <MenuSection
                          title="Telemarketer"
                          items={[
                            { name: "Job Profile & Target", to: "/job-profile-target-telemarketer" },
                          ]}
                        />
                      </div>
                      <div className="mt-4">
                        <MenuSection
                          title="CRE"
                          items={[
                            { name: "Job Profile & Target", to: "/job-profile-target-cre" },
                          ]}
                        />
                      </div>
                    </div>
                    <div>
                      <MenuSection
                        title="Office Executive"
                        items={[
                          { name: "Job Profile & Target", to: "/job-profile-target-office-executive" },
                        ]}
                      />
                      <div className="mt-4">
                        <MenuSection
                          title="HR Rules"
                          items={[
                            { name: "HR Rules & Regulations", to: "/hr-rules" },
                            { name: "Employee Training", to: "/employee-training" },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </DropdownMenu>
              </DropdownNavItem>

              {/* Departments Dropdown */}
              <DropdownNavItem
                icon={FiBriefcase}
                label="Departments"
                isOpen={openDropdown === "departments"}
                onClick={() => handleDropdownClick("departments")}
              >
                <DropdownMenu isOpen={openDropdown === "departments"} width="720px">
                  <div className="grid grid-cols-2 gap-6">
                    <MenuSection
                      title="Marketing Department"
                      items={[
                        { name: "Composite Data", to: "/marketing-composite" },
                        { name: "Life Insurance", to: "/marketing-life" },
                        { name: "Health Insurance", to: "/marketing-health" },
                        { name: "Mutual Fund", to: "/marketing-mutual" },
                        { name: "Real Estate", to: "/marketing-realestate" },
                      ]}
                    />
                    <MenuSection
                      title="Servicing Department"
                      items={[
                        { name: "Composite Data", to: "/servicing-composite" },
                        { name: "Life Insurance", to: "/servicing-life" },
                        { name: "Health Insurance", to: "/servicing-health" },
                        { name: "Mutual Fund", to: "/servicing-mutual" },
                        { name: "Real Estate", to: "/servicing-realestate" },
                      ]}
                    />
                  </div>
                </DropdownMenu>
              </DropdownNavItem>

              {/* Office Dropdown */}
              <DropdownNavItem
                icon={FiHome}
                label="Office"
                isOpen={openDropdown === "office"}
                onClick={() => handleDropdownClick("office")}
              >
                <DropdownMenu isOpen={openDropdown === "office"} width="600px">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <MenuSection
                        title="Financial"
                        items={[
                          { name: "Financial Product List", to: "/financial-product-list" },
                          { name: "Company Name", to: "/company-name" },
                          { name: "MF Registrar", to: "/mutual-fund/registrar" },
                          { name: "MF AMC Name", to: "/mutual-fund/amc" },
                          { name: "Other Product", to: "/other-product" },
                        ]}
                      />
                    </div>
                    <MenuSection
                      title="Office Records"
                      items={[
                        { name: "Office Diary", to: "/office-diary" },
                        { name: "Office Purchase", to: "/office-purchase" },
                        { name: "Important Documents", to: "/important-documents" },
                      ]}
                    />
                  </div>
                </DropdownMenu>
              </DropdownNavItem>

              {/* RM Dropdown */}
              <DropdownNavItem
                icon={FiMessageSquare}
                label="RM"
                isOpen={openDropdown === "crm"}
                onClick={() => handleDropdownClick("crm")}
              >
                <DropdownMenu isOpen={openDropdown === "crm"} width="400px">
                  <MenuSection
                    title="CRM Activities"
                    items={[
                      { name: "Creative Activity", to: "/crm-creative-activity" },
                      { name: "Advertisement", to: "/crm-advertisement" },
                      { name: "Composite Data", to: "/crm-composite-data" },
                    ]}
                  />
                </DropdownMenu>
              </DropdownNavItem>

              {/* Task Dropdown */}
              <DropdownNavItem
                icon={FiCheckSquare}
                label="Task"
                isOpen={openDropdown === "task"}
                onClick={() => handleDropdownClick("task")}
              >
                <DropdownMenu isOpen={openDropdown === "task"} width="450px">
                  <div className="grid grid-cols-2 gap-6">
                    <MenuSection
                      title="Task Categories"
                      items={[
                        { name: "Composite", to: "/task-composite" },
                        { name: "Marketing", to: "/task-marketing" },
                        { name: "Servicing", to: "/task-servicing" },
                      ]}
                    />
                    <MenuSection
                      title="Task Assign"
                      items={[
                        { name: "Assign Task", to: "/task-assign" },
                        { name: "Assign Appointments", to: "/appointment-assign" },
                      ]}
                    />
                  </div>
                </DropdownMenu>
              </DropdownNavItem>

              {/* Reports Dropdown */}
              <DropdownNavItem
                icon={FiFileText}
                label="Reports"
                isOpen={openDropdown === "reports"}
                onClick={() => handleDropdownClick("reports")}
              >
                <DropdownMenu isOpen={openDropdown === "reports"} width="350px">
                  <MenuSection
                    title="Reports"
                    items={[
                      { name: "Employee Report", to: "/reports/employee-report" },
                      { name: "Telecaller Calling Report", to: "/reports/telecaller-report" },
                      { name: "Financial Reports", to: "/financial-product-list" },
                      { name: "Sales Reports", to: "/report-2" },
                      { name: "Customer Reports", to: "/report-3" },
                    ]}
                  />
                </DropdownMenu>
              </DropdownNavItem>
            </div>

            {/* Right Section - Logout & Profile */}
            <div className="flex items-center gap-3">
              {/* Quick Actions */}
              

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-100 hover:shadow-md"
              >
                <FiLogOut className="transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div
            className={`
              overflow-hidden transition-all duration-300 lg:hidden
              ${isMobileMenuOpen ? "max-h-[600px] border-t border-gray-200 py-4" : "max-h-0"}
            `}
          >
            <div className="space-y-2">
              {/* Mobile menu items - quick links */}
              <Link
                to="/"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={closeAllDropdowns}
              >
                <FiGrid size={20} />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                to="/suspect"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={closeAllDropdowns}
              >
                <FiUser size={20} />
                <span className="font-medium">Suspects</span>
              </Link>
              <Link
                to="/prospect"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={closeAllDropdowns}
              >
                <FiTarget size={20} />
                <span className="font-medium">Prospects</span>
              </Link>
              <Link
                to="/client"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={closeAllDropdowns}
              >
                <FiBriefcase size={20} />
                <span className="font-medium">Clients</span>
              </Link>
              <Link
                to="/reports/telecaller-report"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={closeAllDropdowns}
              >
                <FiBarChart2 size={20} />
                <span className="font-medium">Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbarfristn;