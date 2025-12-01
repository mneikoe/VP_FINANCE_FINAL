
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import { getSuspectById} from "../../../redux/feature/SuspectRedux/SuspectThunx";
import { fetchDetails } from "../../../redux/feature/LeadSource/LeadThunx";
import { getAllOccupationTypes} from "../../../redux/feature/OccupationType/OccupationThunx";
import { getAllOccupations } from "../../../redux/feature/LeadOccupation/OccupationThunx";
import { useNavigate, useParams } from "react-router-dom";
import PersonalDetailsForm from "./PersonalDetailFormSuspect";
import FamilyMembersForm from "./FamilyMembersFormSuspect";
import FinancialInformationForm from "./FinancialInformationFormSuspect";
import FuturePrioritiesForm from "./FuturePrioritiesFromSuspect";
import ProposedPlanForm from "./ProposedPanFormSuspect";
import { FaUser, FaUsers, FaRupeeSign, FaBullseye } from "react-icons/fa";

const SuspectFirstForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [suspectId, setSuspectId] = useState(id || "");
  const [isEdit, setIsEdit] = useState(false);
  const [suspectData, setSuspectData] = useState(null);

  useEffect(() => {
    dispatch(getAllOccupationTypes());
    dispatch(getAllOccupations());
    dispatch(fetchDetails());

    if (id) {
      setIsEdit(true);
      dispatch(getSuspectById(id)).then((response) => {
        if (response?.payload?.suspect) {
          setSuspectData(response?.payload?.suspect);
        }
      });
    }
  }, [dispatch, id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSuspectCreated = (newSuspectId) => {
    setSuspectId(newSuspectId);
  };

  return (
    <div className="container py-5">
      <h1>Suspect</h1>
      <ul className="nav nav-pills mb-3 bg-white shadow-lg" id="pills-tab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${activeTab === "personal" ? "active-custom" : ""}`}
            onClick={() => handleTabChange("personal")}
          >
            <FaUser className="me-2" /> Personal Details
          </button>
        </li>
        {/* <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${activeTab === "family" ? "active-custom" : ""}`}
            onClick={() => handleTabChange("family")}
          >
            <FaUsers className="me-2" /> Add Family Details
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${activeTab === "financial" ? "active-custom" : ""}`}
            onClick={() => handleTabChange("financial")}
          >
            <FaRupeeSign className="me-2" /> Financial Details
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${activeTab === "priorities" ? "active-custom" : ""}`}
            onClick={() => handleTabChange("priorities")}
          >
            <FaBullseye className="me-2" /> Future's Priorities
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${activeTab === "proposed" ? "active-custom" : ""}`}
            onClick={() => handleTabChange("proposed")}
          >
            <FaBullseye className="me-2" /> Proposed Financial Plan
          </button>
        </li> */}
      </ul>

      <div className="tab-content p-4 border rounded bg-light">
        {activeTab === "personal" && (
          <PersonalDetailsForm
            isEdit={isEdit}
            suspectData={suspectData}
            onSuspectCreated={handleSuspectCreated}
          />
        )}
        {activeTab === "family" && (
          <FamilyMembersForm
            suspectId={suspectId}
            suspectData={isEdit ? suspectData : null}
            onSuspectCreated={handleSuspectCreated}
          />
        )}
        {activeTab === "financial" && (
          <FinancialInformationForm
            suspectId={suspectId}
            suspectData={isEdit ? suspectData : null}
            onSuspectCreated={handleSuspectCreated}
          />
        )}
        {activeTab === "priorities" && (
          <FuturePrioritiesForm
            suspectId={suspectId}
            suspectData={isEdit ? suspectData : null}
            onSuspectCreated={handleSuspectCreated}
          />
        )}
        {activeTab === "proposed" && (
          <ProposedPlanForm
            suspectId={suspectId}
            suspectData={isEdit ? suspectData : null}
          />
        )}
      </div>
    </div>
  );
};

export default SuspectFirstForm;