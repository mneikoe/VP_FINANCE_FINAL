import React, { useState } from "react";
import Registrar from "./Registrar";
import RegistrarDetail from "./RegistrarDetail";

function RegistrarTabs() {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <h3>MUTUAL FUND & REGISTRAR NAME</h3>

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
          Add Registrar Name
        </div>
        <div
          onClick={() => setActiveTab("view")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderBottom: activeTab === "view" ? "3px solid #007bff" : "none",
          }}
        >
          View Registrar Name
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        {activeTab === "add" ? (
          <Registrar
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            editId={editId}
          />
        ) : (
          <RegistrarDetail setActiveTab={setActiveTab} setEditId={setEditId} />
        )}
      </div>
    </div>
  );
}

export default RegistrarTabs;
