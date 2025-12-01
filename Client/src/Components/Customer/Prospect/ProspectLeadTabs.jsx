import React, { useState } from "react";
import DisplayProspect from "./DisplayProspect";

import ProspectForm  from "./ProspectFirstForm"

const ProspectLeadTabs = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(""); // 👈 Track which lead is being edited
  console.log(editId, "id prospect tab");
  return (
    <div className=" p-4 mt-4">
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
          Add Prospect Lead
        </button>
        <button
          className={`btn btn-${
            activeTab === "display" ? "primary" : "outline-primary"
          }`}
          onClick={() => setActiveTab("display")}
        >
           Prospect Leads
        </button>
      </div>

      {/* Tab Content */}
      <div  >
        {activeTab === "add" && <ProspectForm editId={editId} />}
        {activeTab === "display" && (
          <DisplayProspect setActiveTab={setActiveTab} setEditId={setEditId} />
        )}
      </div>
    </div>
  );
};

export default ProspectLeadTabs