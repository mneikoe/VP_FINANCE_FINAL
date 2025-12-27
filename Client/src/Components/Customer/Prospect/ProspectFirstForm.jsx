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

  return (
    <div className="container py-5">
      <h1>Prospect</h1>

      <ul
        className="nav nav-pills mb-3 bg-white shadow-lg"
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
      <div className="tab-content p-4 border rounded bg-light">
        {activeTab === "personal" && (
          <PersonalDetailsForm
            isEdit={isEdit}
            prospectData={prospectData}
            onProspectCreated={handleProspectCreated}
          />
        )}
        {activeTab === "family" && (
          <FamilyMembersForm
            prospectId={prospectId}
            prospectData={isEdit ? prospectData : null}
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
  .custom-tab {
    padding: 10px 20px;
    border-radius: 0;
    border: none;
    background: transparent;
    color: #6c757d;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .custom-tab:hover {
    color: #0d6efd;
    background: rgba(13, 110, 253, 0.1);
  }
  
  .active-custom {
    color: #ffffff !important;
    background: linear-gradient(135deg, #0d6efd, #0b5ed7) !important;
    border-bottom: 3px solid #0a58ca !important;
    box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2) !important;
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
`}</style>
    </div>
  );
};

export default ProspectFirstForm;
