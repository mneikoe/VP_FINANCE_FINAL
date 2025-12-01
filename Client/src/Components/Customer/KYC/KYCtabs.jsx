import React, { useState } from "react";
import AddKYC from "./AddKYC";
import DisplayKYC from "./DisplayKYC";

const KYCtabs = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null); // 👈 Track which lead is being edited

  return (
    <div className="container mt-4">
      {/* Tab Buttons */}
      <div className="d-flex mb-3">
        <button
          className={`btn btn-${
            activeTab === "add" ? "primary" : "outline-primary"
          } me-2`}
          onClick={() => {
            setEditId(null); // clear any editing state when adding fresh
            setActiveTab("add");
          }}
        >
          Add KYC
        </button>
        <button
          className={`btn btn-${
            activeTab === "display" ? "primary" : "outline-primary"
          }`}
          onClick={() => setActiveTab("display")}
        >
          Display KYC
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "add" && <AddKYC editId={editId} />}
        {activeTab === "display" && (
          <DisplayKYC setActiveTab={setActiveTab} setEditId={setEditId} />
        )}
      </div>
    </div>
  );
};

export default KYCtabs;
