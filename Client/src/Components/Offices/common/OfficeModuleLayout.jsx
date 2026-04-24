import React from "react";

const OfficeModuleLayout = ({
  title,
  subtitle,
  activeTab,
  onTabChange,
  tabs = [],
  children,
}) => {
  return (
    <div className="office-module-shell">
      <style>
        {`
          .office-module-shell {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 14px;
          }
          .office-module-head {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 12px;
            margin-bottom: 10px;
          }
          .office-module-title {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 700;
            color: #1f2937;
          }
          .office-module-subtitle {
            margin: 2px 0 0;
            font-size: 0.8rem;
            color: #6b7280;
          }
          .office-module-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;
          }
          .office-module-tab {
            border: 1px solid #cbd5e1;
            background: #fff;
            color: #334155;
            border-radius: 999px;
            padding: 6px 12px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
          }
          .office-module-tab.active {
            background: #2563eb;
            color: #fff;
            border-color: #2563eb;
            box-shadow: 0 2px 10px rgba(37, 99, 235, 0.2);
          }
          .office-module-content {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 12px;
          }
        `}
      </style>

      <div className="office-module-head">
        <div>
          <h3 className="office-module-title">{title}</h3>
          {subtitle ? <p className="office-module-subtitle">{subtitle}</p> : null}
        </div>
      </div>

      {tabs.length > 0 ? (
        <div className="office-module-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`office-module-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="office-module-content">{children}</div>
    </div>
  );
};

export default OfficeModuleLayout;
