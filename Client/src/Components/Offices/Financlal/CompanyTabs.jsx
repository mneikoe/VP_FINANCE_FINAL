import React, { useState } from "react";
import AddCompanyName from "./AddCompanyName";
import CompanyDetail from "./CompanyDetail";

function CompanyTabs() {
  const [activeTab, setActiveTab] = useState("add");

  const [editId, setEditId] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <h3>Financial Product & Company Name</h3>

      <div style={{ display: "flex", borderBottom: "2px solid #ccc" }}>
        <div
          onClick={() => {
            setEditId(null);
            setActiveTab("add");
          }}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderBottom: activeTab === "add" ? "3px solid #007bff" : "none",
          }}
        >
          Add Company Name
        </div>
        <div
          onClick={() => setActiveTab("view")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderBottom: activeTab === "view" ? "3px solid #007bff" : "none",
          }}
        >
          View Company Name
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        {activeTab === "add" ? (
          <div>
            {/* Add Company Name content */}
            <AddCompanyName
              setActiveTab={setActiveTab}
              setEditId={setEditId}
              editId={editId}
            />
          </div>
        ) : (
          <div>
            {/* Company Detail content */}
            <CompanyDetail setActiveTab={setActiveTab} setEditId={setEditId} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyTabs;
