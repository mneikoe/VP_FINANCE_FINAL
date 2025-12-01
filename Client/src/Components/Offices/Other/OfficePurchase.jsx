import React, { useState } from "react";
import AddOfficePurchase from "./AddOfficePurchase";
import OfficePurchaseDetail from "./OfficePurchaseDetail";

function OfficePurchase() {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <h3>Office Purchase</h3>

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
          Add office purchase
        </div>
        <div
          onClick={() => setActiveTab("view")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderBottom: activeTab === "view" ? "3px solid #007bff" : "none",
          }}
        >
          View office purchase
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        {activeTab === "add" ? (
          <AddOfficePurchase
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            editId={editId}
          />
        ) : (
          <OfficePurchaseDetail
            setActiveTab={setActiveTab}
            setEditId={setEditId}
          />
        )}
      </div>
    </div>
  );
}

export default OfficePurchase;
