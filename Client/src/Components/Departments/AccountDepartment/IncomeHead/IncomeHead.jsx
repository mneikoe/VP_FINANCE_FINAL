import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import CreateIncomeHeadAccount from "./CreateIncomeHeadAccount";
// import IncomeHeadAccounts from "./IncomeHeadAccounts"; // if you have listing component

const IncomeHead = () => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="container">
      <h1>Income Head</h1>

      <ul
        className="nav nav-pills mb-3 bg-white shadow-lg gap-2 p-2"
        role="tablist"
      >
        <li className="nav-item">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-3 py-2 rounded font-semibold transition ${
              activeTab === "list"
                ? "bg-blue-600 text-white"
                : "bg-blue-200 hover:scale-105"
            }`}
          >
            Income Head Accounts
          </button>
        </li>

        <li className="nav-item">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3 py-2 rounded font-semibold transition ${
              activeTab === "create"
                ? "bg-blue-600 text-white"
                : "bg-blue-200 hover:scale-105"
            }`}
          >
            Create Account
          </button>
        </li>
      </ul>

      <div className="tab-content p-4 border rounded bg-light">
        {activeTab === "list" && (
          <div>
            <h4>Income Head Accounts List</h4>
          </div>
        )}

        {activeTab === "create" && <CreateIncomeHeadAccount />}
      </div>
    </div>
  );
};

export default IncomeHead;
