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
  FiBell,
  FiTrendingUp,
} from "react-icons/fi";

const Navbarfristn = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navbarRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");



  // 🔔 Notification State
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New client added", read: false },
    { id: 2, text: "Task assigned to you", read: false },
    { id: 3, text: "Meeting scheduled", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const handleDropdownClick = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setShowNotification(false);
        setShowProfileCard(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation Item
  const NavItem = ({ to, icon: Icon, label, active, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative flex h-12 min-w-[60px] lg:min-w-[64px] xl:min-w-[80px] cursor-pointer flex-col items-center justify-center 
        rounded-lg px-1 xl:px-2 transition-all duration-200
        ${active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
      `}
    >
      <Icon className="text-base xl:text-lg" />
      <span className="text-[9px] xl:text-[11px] font-medium tracking-wide text-center">{label}</span>
      {active && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-blue-600" />
      )}
    </Link>
  );

  // ✅ FIX: Dropdown Container - handles hover for both trigger and menu
  const DropdownContainer = ({ name, icon: Icon, label, width = "600px", children }) => {
    const isOpen = openDropdown === name;

    // Determine alignment based on menu name
    const isRightAligned = ["task", "reports", "depart"].includes(name);

    return (
      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => handleDropdownClick(name)}
          className={`
            relative flex h-12 min-w-[60px] lg:min-w-[64px] xl:min-w-[80px] cursor-pointer flex-col items-center justify-center 
            rounded-lg px-1 xl:px-2 transition-all duration-200
            ${isOpen ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
          `}
        >
          <Icon className="text-base xl:text-lg" />
          <div className="flex items-center">
            <span className="text-[9px] xl:text-[11px] font-medium tracking-wide">{label}</span>
            <FiChevronDown
              className={`ml-0.5 text-[9px] xl:text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                }`}
            />
          </div>
          {isOpen && (
            <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-blue-600" />
          )}
        </button>

        {/* Click-open menu avoids hover gap issues on dense pages */}
        {isOpen && (
          <div
            className={`absolute top-full z-[110] mt-1 max-h-[min(75vh,560px)] overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-xl
              ${isRightAligned ? "right-0" : "left-0"} 
              ${name === "depart" || name === "employee" ? "lg:-translate-x-1/4 xl:-translate-x-1/2 xl:left-1/2" : ""}
            `}
            style={{ width: `min(${width}, 92vw)` }}
          >
            <div className="p-4 xl:p-5">{children}</div>
          </div>
        )}
      </div>
    );
  };

  // Menu Section
  const MenuSection = ({ title, items }) => (
    <div>
      <h6 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-black">
        {title}
      </h6>
      <div className="space-y-0.5">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className="block rounded-md px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 hover:text-blue-600"
            onClick={closeAllDropdowns}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );

  // Mobile Menu Section
  const MobileMenuSection = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="border-b border-gray-100 last:border-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span>{title}</span>
          <FiChevronDown
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>
        {isOpen && (
          <div className="bg-gray-50 px-4 py-2">
            {items.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                className="block py-2 pl-4 text-sm text-gray-600 hover:text-blue-600"
                onClick={closeAllDropdowns}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Menu configuration
  const menuConfig = {
    masters: {
      width: "780px",
      sections: [
        {
          title: "Task ",
          items: [
            { name: "Composite Task", to: "/composite" },
            { name: "Marketing Task", to: "/marketing-task" },
            { name: "Servicing Task", to: "/servicing-task" },
          ],
        },
        {
          title: "Area ",
          items: [
            { name: "Add Area", to: "/area" },
            { name: "Add Sub Area", to: "/sub-area" },
          ],
        },
        {
          title: "Lead ",
          items: [
            { name: "Lead Source", to: "/lead-type" },
            { name: "Lead Name", to: "/lead-source" },

            { name: "Occupation Type", to: "/occupation-type" },
            { name: "Occupation Name", to: "/lead-occupation" },
            { name: "Calling Purpose", to: "/calling-purpose" },
          ],
        },
        {
          title: "Document",
          items: [
            { name: "Document Type", to: "/kycdocument" },
            { name: "Document Name ", to: "/kyc-document-name-master" },
          ],
        },
      ],
    },
    financial: {
      width: "360px",
      sections: [
        {
          title: "Financial Services",
          items: [
            { name: "Financial Products", to: "/financial-product-list" },
            { name: "Company Name", to: "/company-name" },
            { name: "MF Registrar", to: "/mutual-fund/registrar" },
            { name: "MF AMC Name", to: "/mutual-fund/amc" },
            { name: "Other Product", to: "/other-product" },
          ],
        },
      ],
    },
    customers: {
      width: "560px",
      sections: [
        {
          title: "Suspect",
          items: [
            { name: "Add Suspect", to: "/suspect/add" },
            { name: "Suspect List", to: "/suspect" },
            { name: "Import Lead", to: "/import-lead" },
          ],
        },
        {
          title: "Prospect",
          items: [
            { name: "Add Prospect", to: "/prospect/add" },
            { name: "Prospect List", to: "/prospect" },
          ],
        },
        {
          title: "Client",
          items: [
            { name: "Add Client", to: "/client/add" },
            { name: "Client List", to: "/client" },
          ],
        },
      ],
    },
    employee: {
      width: "720px",
      sections: [
        {
          title: "Office Admin",
          items: [
            { name: "Job Profile & Target", to: "/job-profile-target-admin" },
            { name: "All Employee", to: "/all-employee" },

          ],
        },
        {
          title: "Telecaller",
          items: [
            { name: "Job Profile & Target", to: "/job-profile-target-telecaller" },
          ],
        },
        {
          title: "CRE",
          items: [
            { name: "Job Profile & Target", to: "/job-profile-target-cre" },
          ],
        },
        {
          title: "HR",
          items: [
            { name: "HR Rules & Regulations", to: "/hr-rules" },
            { name: "Employee Training", to: "/employee-training" },
          ],
        },
        {
          title: "Telemarketer",
          items: [
            { name: "Job Profile & Target", to: "/job-profile-target-telemarketer" },
          ],
        },
        {
          title: "Office Executive",
          items: [
            { name: "Job Profile & Target", to: "/job-profile-target-office-executive" },
          ],
        },
      ],
    },
    departments: {
      width: "780px",
      sections: [
        {
          title: "Marketing",
          items: [{ name: "Marketing Documents", to: "/marketing-documents" }],
        },
        {
          title: "Servicing",
          items: [{ name: "Servicing Documents", to: "/servicing-documents" }],
        },
        {
          title: "Office Records",
          items: [
            { name: "Office Diary", to: "/office-diary" },
            { name: "Office Purchase", to: "/office-purchase" },
            { name: "Important Documents", to: "/important-documents" },
          ],
        },
        {
          title: "CRM Activities",
          items: [
            { name: "CRM Advertisement Activities", to: "/crm-advertisement-activities" },
            { name: "CRM Creativity Activities", to: "/crm-creativity-activities" },
            { name: "CRM Relationship Activities", to: "/crm-relationship-activities" },
          ],
        },
      ],
    },

    task: {
      width: "400px",
      sections: [
        {
          title: "Task Categories",
          items: [
            { name: "Composite", to: "/task-composite" },
            { name: "Marketing", to: "/task-marketing" },
            { name: "Servicing", to: "/task-servicing" },
          ],
        },
        {
          title: "Task Assign",
          items: [
            { name: "Assign Task", to: "/task-assign" },
            { name: "Assign Appointments", to: "/appointment-assign" },
          ],
        },
      ],
    },
    reports: {
      width: "320px",
      sections: [
        {
          title: "Reports",
          items: [
            { name: "Employee Report", to: "/reports/employee-report" },
            { name: "Telecaller Report", to: "/reports/telecaller-report" },
            { name: "Financial Reports", to: "/financial-product-list" },
            { name: "Sales Reports", to: "/report-2" },
            { name: "Customer Reports", to: "/report-3" },
          ],
        },
      ],
    },
  };

  const dropdownMenus = {
    masters: { ...menuConfig.masters, icon: FiLayers, label: "Masters" },
    customers: { ...menuConfig.customers, icon: FiUser, label: "Customers" },
    employee: { ...menuConfig.employee, icon: FiUsers, label: "Employee" },
    financial: { ...menuConfig.financial, icon: FiTrendingUp, label: "Financial" },
    depart: { ...menuConfig.departments, icon: FiBriefcase, label: "Department" },
    task: { ...menuConfig.task, icon: FiCheckSquare, label: "Task" },
    reports: { ...menuConfig.reports, icon: FiFileText, label: "Reports" },
  };

  return (
    <div
      ref={navbarRef}
      className="font-sans border shadow-md"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-blue-400 to-blue-500" />

      <nav
        className={`
          sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm
          transition-shadow duration-200
          ${scrolled ? "shadow-sm" : ""}
        `}
      >
        <div className="mx-auto w-full max-w-[1800px] px-4 lg:px-6 ">
          <div className="flex h-14 items-center justify-between gap-1 lg:gap-2 xl:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>

              <Link to="/" onClick={closeAllDropdowns} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <span className="text-base font-bold text-white">VP</span>
                </div>
                <div className="hidden lg:block">
                  <div className="text-base font-semibold leading-tight text-gray-800">
                    VPFinancial
                  </div>
                  <div className="text-[10px] font-medium text-blue-500">Nest</div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden flex-1 overflow-visible lg:flex lg:items-center border shadow-sm rounded-full lg:justify-center lg:gap-px xl:gap-0.5 bg-gray-50/50">
              <NavItem
                to="/"
                icon={FiGrid}
                label="Dashboard"
                active={isPathActive(["/"])}
                onClick={closeAllDropdowns}
              />

              {Object.entries(dropdownMenus).map(([key, menu]) => (
                <DropdownContainer
                  key={key}
                  name={key}
                  icon={menu.icon}
                  label={menu.label}
                  width={menu.width}
                >
                  <div
                    className="grid gap-4 xl:gap-6"
                    style={{
                      gridTemplateColumns: `repeat(${menu.sections.length === 1 ? 1 : menu.sections.length === 2 ? 2 : menu.sections.length === 4 ? 4 : 3}, minmax(0, 1fr))`,
                    }}
                  >
                    {menu.sections.map((section, idx) => (
                      <MenuSection key={idx} title={section.title} items={section.items} />
                    ))}
                  </div>
                </DropdownContainer>
              ))}

              <NavItem
                to="/notification-manager"
                icon={FiBell}
                label="Notifications"
                active={isPathActive(["/notification-manager"])}
                onClick={closeAllDropdowns}
              />
            </div>

            {/* Notification Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotification((prev) => !prev)}
                className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                aria-label="Notifications"
              >
                <FiBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotification && (
                <div className="absolute right-0 top-11 z-50 w-72 rounded-lg border border-gray-100 bg-white p-3 shadow-lg">
                  <div className="mb-2 text-sm font-semibold text-gray-700">Notifications</div>
                  <div className="space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500">No new notifications</p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-md px-2 py-1.5 text-xs ${item.read ? "bg-gray-50 text-gray-500" : "bg-blue-50 text-blue-700"
                            }`}
                        >
                          {item.text}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileCard((prev) => !prev)}
                className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                aria-label="Profile details"
              >
                <FiUser className="text-lg" />
              </button>

              {showProfileCard && (
                <div className="absolute right-0 top-11 z-50 w-64 rounded-lg border border-gray-100 bg-white p-3 shadow-lg">
                  <div className="mb-2 text-sm font-semibold text-gray-700">
                    Logged In User
                  </div>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div>
                      <span className="font-medium">Name: </span>
                      {loggedInUser.username || loggedInUser.name || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Role: </span>
                      {loggedInUser.role || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Email: </span>
                      {loggedInUser.email || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Mobile: </span>
                      {loggedInUser.mobileno || loggedInUser.mobileNo || "-"}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <Link
                      to={loggedInUser.role === "HR" ? `/dashboard/employee/${loggedInUser._id || loggedInUser.id}` : `/employee/${loggedInUser._id || loggedInUser.id}`}
                      className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition-all hover:bg-blue-100"
                      onClick={() => setShowProfileCard(false)}
                    >
                      <FiUser size={14} />
                      View My Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-100"
            >
              <FiLogOut className="text-sm" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`
              overflow-hidden transition-all duration-200 lg:hidden
              ${isMobileMenuOpen ? "max-h-[500px] border-t border-gray-100" : "max-h-0"}
            `}
          >
            <div className="max-h-[500px] overflow-y-auto py-2">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                onClick={closeAllDropdowns}
              >
                <FiGrid size={18} />
                <span>Dashboard</span>
              </Link>

              {Object.entries(dropdownMenus).map(([key, menu]) => (
                <MobileMenuSection
                  key={key}
                  title={menu.label}
                  items={menu.sections.flatMap(s => s.items)}
                />
              ))}

              <Link
                to="/notification-manager"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                onClick={closeAllDropdowns}
              >
                <FiBell size={18} />
                <span>Notifications</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbarfristn;