import React, { useState } from "react";

import AddImpDocument from "./AddImpDocument";
import ImpDocumentDetail from "./ImpDocumentDetail";

function ImpDocument() {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <h3>Important Document</h3>

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
          Add document
        </div>
        <div
          onClick={() => setActiveTab("view")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderBottom: activeTab === "view" ? "3px solid #007bff" : "none",
          }}
        >
          View document
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        {activeTab === "add" ? (
          <AddImpDocument
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            editId={editId}
          />
        ) : (
          <ImpDocumentDetail
            setActiveTab={setActiveTab}
            setEditId={setEditId}
          />
        )}
      </div>
    </div>
  );
}

export default ImpDocument;
