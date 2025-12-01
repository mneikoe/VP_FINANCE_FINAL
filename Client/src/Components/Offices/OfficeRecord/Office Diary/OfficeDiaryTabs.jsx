import React, { useState } from "react";
import AddOfficeDiary from "./AddOfficeDiary";
import OfficeDiaryDetail from "./OfficeDiaryDetail";

function OfficeDiaryTabs() {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);

  return (
    <div style={{ padding: "" }}>
      <h3>Office Diary</h3>

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
          Add Dairy Name
        </div>
        <div
          onClick={() => setActiveTab("view")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderBottom: activeTab === "view" ? "3px solid #007bff" : "none",
          }}
        >
          View Dairy Name
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        {activeTab === "add" ? (
          <AddOfficeDiary
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            editId={editId}
          />
        ) : (
          <OfficeDiaryDetail
            setActiveTab={setActiveTab}
            setEditId={setEditId}
          />
        )}
      </div>
    </div>
  );
}

export default OfficeDiaryTabs;
