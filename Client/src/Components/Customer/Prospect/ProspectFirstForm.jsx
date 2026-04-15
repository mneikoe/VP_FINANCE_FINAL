import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import { getProspectById } from "../../../redux/feature/ProspectRedux/ProspectThunx";
import { fetchDetails } from "../../../redux/feature/LeadSource/LeadThunx";
import { getAllOccupationTypes } from "../../../redux/feature/OccupationType/OccupationThunx";
import { getAllOccupations } from "../../../redux/feature/LeadOccupation/OccupationThunx";
import { useNavigate, useParams } from "react-router-dom";
import PersonalDetailsForm from "./PersonalDetailFormProspect";
import FamilyMembersForm from "./FamilyMembersFormForProspect";
import FinancialInformationForm from "./FinancialInformationFormForProspect";
import FuturePrioritiesForm from "./FuturePrioririesFormForProspect";
import ProposedPlanForm from "./ProposedPlanFormForProspect";
import { FaUser, FaUsers, FaRupeeSign, FaBullseye } from "react-icons/fa";

const ProspectFirstForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [prospectId, setProspectId] = useState(id || "");
  const [isEdit, setIsEdit] = useState(false);
  const [prospectData, setProspectData] = useState(null);
  const [personalDraft, setPersonalDraft] = useState(null);

  useEffect(() => {
    dispatch(getAllOccupationTypes());
    dispatch(getAllOccupations());
    dispatch(fetchDetails());

    if (id) {
      setIsEdit(true);
      dispatch(getProspectById(id)).then((response) => {
        if (response?.payload?.prospect) {
          setProspectData(response?.payload?.prospect);
        }
      });
    }
  }, [dispatch, id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleProspectCreated = (newProspectId) => {
    // setProspectData(newProspectId);
    setProspectId(newProspectId);
  };
  const sectionTitles = {
    personal: { icon: <FaUser />, label: "Personal Details" },
    family: { icon: <FaUsers />, label: "Family Details" },
    financial: { icon: <FaRupeeSign />, label: "Financial Information" },
    priorities: { icon: <FaBullseye />, label: "Future Priorities" },
    proposed: { icon: <FaBullseye />, label: "Proposed Financial Plan" },
  };

  return (
    <div className="container-fluid p-0">
      <div className="prospect-form-shell border rounded-3 bg-white p-2 shadow-sm">
      <h6 className="mb-1 fw-semibold">Prospect</h6>

      <ul
        className="nav nav-pills mb-1 bg-white shadow-sm rounded"
        id="pills-tab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${
              activeTab === "personal" ? "active-custom blue" : ""
            }`}
            onClick={() => handleTabChange("personal")}
          >
            <FaUser className="me-2" /> Personal Details
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${
              activeTab === "family" ? "active-custom green" : ""
            }`}
            onClick={() => handleTabChange("family")}
          >
            <FaUsers className="me-2" /> Add Family Details
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${
              activeTab === "financial" ? "active-custom purple" : ""
            }`}
            onClick={() => handleTabChange("financial")}
          >
            <FaRupeeSign className="me-2" /> Financial Details
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${
              activeTab === "priorities" ? "active-custom orange" : ""
            }`}
            onClick={() => handleTabChange("priorities")}
          >
            <FaBullseye className="me-2" /> Future's Priorities
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${
              activeTab === "proposed" ? "active-custom" : ""
            }`}
            onClick={() => handleTabChange("proposed")}
          >
            <FaBullseye className="me-2" /> Proposed Financial Plan
          </button>
        </li>
      </ul>
      <div className="tab-content p-2 border rounded bg-light">
        <h6 className="mb-1 text-primary fw-semibold section-title">
          {sectionTitles[activeTab]?.icon}
          {sectionTitles[activeTab]?.label}
        </h6>
        {activeTab === "personal" && (
          <PersonalDetailsForm
            isEdit={isEdit}
            prospectData={prospectData}
            onProspectCreated={handleProspectCreated}
            onFormDataUpdate={setPersonalDraft}
          />
        )}
        {activeTab === "family" && (
          <FamilyMembersForm
            prospectId={prospectId}
            prospectData={
              isEdit
                ? prospectData
                : personalDraft
                  ? { personalDetails: personalDraft }
                  : null
            }
            onProspectCreated={handleProspectCreated}
          />
        )}
        {activeTab === "financial" && (
          <FinancialInformationForm
            prospectId={prospectId}
            prospectData={isEdit ? prospectData : null}
            onProspectCreated={handleProspectCreated}
          />
        )}
        {activeTab === "priorities" && (
          <FuturePrioritiesForm
            prospectId={prospectId}
            prospectData={isEdit ? prospectData : null}
            onProspectCreated={handleProspectCreated}
          />
        )}
        {activeTab === "proposed" && (
          <ProposedPlanForm
            prospectId={prospectId}
            prospectData={isEdit ? prospectData : null}
          />
        )}
      </div>
      <style>{`
  .prospect-form-shell {
    border-color: #e5e7eb !important;
  }
  .custom-tab {
    padding: 5px 10px;
    border-radius: 0;
    border: none;
    background: transparent;
    color: #6c757d;
    font-weight: 500;
    font-size: 0.8rem;
    transition: all 0.3s ease;
  }
  
  .custom-tab:hover {
    color: #0d6efd;
    background: rgba(13, 110, 253, 0.1);
  }
  
  .active-custom {
    color: #ffffff !important;
    background: linear-gradient(135deg, #0d6efd, #0b5ed7) !important;
    border-bottom: 2px solid #0a58ca !important;
    box-shadow: 0 2px 4px rgba(13, 110, 253, 0.15) !important;
  }
  
  /* Alternative color options */
  .active-custom.blue {
    background: linear-gradient(135deg, #0d6efd, #0b5ed7) !important;
  }
  
  .active-custom.green {
    background: linear-gradient(135deg, #198754, #157347) !important;
  }
  
  .active-custom.purple {
    background: linear-gradient(135deg, #6f42c1, #5a32a3) !important;
  }
  
  .active-custom.orange {
    background: linear-gradient(135deg, #fd7e14, #e96a00) !important;
  }
  .section-title {
    font-size: 0.9rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.35rem;
  }
`}</style>
      </div>
    </div>
  );
};

export default ProspectFirstForm;
