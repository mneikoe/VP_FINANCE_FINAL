import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DisplayClient from "./DisplayClient";
import ClientForm from "./ClientFirstFrom";
import { useParams } from "react-router-dom";

const ClientLeadTabs = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);

  const {tabs} = useParams()

  useEffect(()=>{
    if (tabs == "proposed") {

      setActiveTab("add")
    }
  },[])

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab); // agar route se tab aaya ho to use set karo
    }
  }, [location.state]);

  return (
    <div className="p-4 mt-4">
      
{/* <h1>Clients</h1> */}

      <div className="d-flex mb-3">
        <button
          className={`btn btn-${activeTab === "add" ? "primary" : "outline-primary"} me-2`}
          onClick={() => {
            setEditId(null);
            setActiveTab("add");
          }}
        >
          Add Client Lead
        </button>
        <button
          className={`btn btn-${activeTab === "display" ? "primary" : "outline-primary"}`}
          onClick={() => setActiveTab("display")}
        >
          Client Leads
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "add" && <ClientForm editId={editId} />}
        {activeTab === "display" && (
          <DisplayClient setActiveTab={setActiveTab} setEditId={setEditId} />
        )}
      </div>
    </div>
  );
};

export default ClientLeadTabs;
