// components/HRDashboard/TopNavigation.jsx
import React from 'react';

const TopNavigation = ({ setSidebarOpen }) => {
  const currentDate = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user?.username || user?.name || 'HR Manager';
  const userEmail = user?.email || 'hr@company.com';

  return (
    <header className="hr-top-nav border-bottom" style={{borderColor: '#ffffff'}}>
      <div className="d-flex align-items-center justify-content-between h-100 px-3 px-md-4">
        {/* Left: mobile menu + user info */}
        <div className="d-flex align-items-center">
          {/* Mobile menu button */}
          <button
            className="d-md-none btn btn-link text-white p-2 me-2"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>

          {/* User info (responsive) */}
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
            <h2 className="h6 h5-md fw-semibold text-white mb-0 me-md-3">
              {userName}
            </h2>
            <span className="small text-white" style={{opacity: 0.9}}>
              Email: {userEmail}
            </span>
          </div>
        </div>

        {/* Right: Date */}
        <div className="text-white small fw-medium text-end">
          {currentDate}
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;