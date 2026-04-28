import React, { useState } from "react";

import ExpenseAccount from "./ExpenseAccount";
import Expense from "./Expense"


const IncomeHead = () => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="container">
      <h1>Expenses Head</h1>

      <ul className="nav nav-pills mb-3 bg-white shadow gap-2 p-2">
        <li>
          <button
            onClick={() => setActiveTab("list")}
            className={`px-3 py-2 rounded ${activeTab === "list" ? "bg-danger text-white" : "bg-light"}`}
          >
            Expense
          </button>
        </li>

        <li>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3 py-2 rounded ${activeTab === "create" ? "bg-danger text-white" : "bg-light"}`}
          >
            Expenses Head Master
          </button>
        </li>

        
      </ul>

      <div className="p-3 border rounded bg-light">
        {activeTab === "list" && <Expense />}
        {activeTab === "create" && <ExpenseAccount />}
        
      </div>
    </div>
  );
};

export default IncomeHead;
