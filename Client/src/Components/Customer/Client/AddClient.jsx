import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PersonalDetailsForm from "./PersonalDetailsForm";
import FamilyMembersForm from "./FamilyMembersForm";
import FinancialInfoForm from "./FinancialInformationForm";
import FuturePrioritiesForm from "./FuturePrioritiesForm";
import ProposedPlanForm from "./ProposedPlanForm";


const AddClient = ({ editId, setActiveTab }) => {
  const [activeTab, setActiveTabState] = useState("personalDetails");
  const [formData, setFormData] = useState({});
  const [isEditMode, setIsEditMode] = useState(!!editId);
  const [clientId, setClientId] = useState(editId);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.client);

  
  const handleDataChange = (data) => {
    setFormData(data);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personalDetails":
        return (
          <PersonalDetailsForm
            onDataChange={handleDataChange}
            initialData={formData}
            isEditMode={isEditMode}
          />
        );
      case "familyMembers":
        return <FamilyMembersForm clientId={clientId} />;
      case "financialInfo":
        return <FinancialInfoForm clientId={clientId} />;
      case "futurePriorities":
        return <FuturePrioritiesForm clientId={clientId} />;
      case "proposedPlan":
        return <ProposedPlanForm clientId={clientId} />;
      default:
        return <PersonalDetailsForm onDataChange={handlePersonalDetailsSubmit} />;
    }
  };

  return (
    <div className="mx-auto mt-6 px-4">
      <ul className="nav nav-pills mb-3 bg-white shadow-lg" id="pills-tab" role="tablist">
        <li className="nav-item" role="presentation">
          <button className={`nav-link custom-tab ${activeTab === "personalDetails" ? "active-custom" : ""}`} onClick={() => setActiveTabState("personalDetails")}>
            Personal Details
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link custom-tab ${activeTab === "familyMembers" ? "active-custom" : ""}`} onClick={() => setActiveTabState("familyMembers")} disabled={!clientId}>
            Family Members
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link custom-tab ${activeTab === "financialInfo" ? "active-custom" : ""}`} onClick={() => setActiveTabState("financialInfo")} disabled={!clientId}>
            Financial Info
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link custom-tab ${activeTab === "futurePriorities" ? "active-custom" : ""}`} onClick={() => setActiveTabState("futurePriorities")} disabled={!clientId}>
            Future Priorities
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link custom-tab ${activeTab === "proposedPlan" ? "active-custom" : ""}`} onClick={() => setActiveTabState("proposedPlan")} disabled={!clientId}>
            Proposed Plan
          </button>
        </li>
      </ul>

      <div className="tab-content p-4 border rounded bg-light">
        {loading && <p className="text-blue-600">Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {renderTabContent()}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddClient;