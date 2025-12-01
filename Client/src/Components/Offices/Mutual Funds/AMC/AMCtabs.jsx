import React, { useState } from "react";
import AMC from "./AMC";
import AMCDetail from "./AMCDetail";

function AMCtabs() {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <h3>AMC NAME</h3>

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
          Add AMC Name
        </div>
        <div
          onClick={() => setActiveTab("view")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderBottom: activeTab === "view" ? "3px solid #007bff" : "none",
          }}
        >
          View AMC Name
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        {activeTab === "add" ? (
          <AMC
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            editId={editId}
          />
        ) : (
          <AMCDetail setActiveTab={setActiveTab} setEditId={setEditId} />
        )}
      </div>
    </div>
  );
}

export default AMCtabs;
