

import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "/src/config/axios";
import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { addFinancialInfo, updateFinancialInfo } from "../../../redux/feature/ClientRedux/ClientThunx";
import { toast } from "react-toastify";

const INSURANCE_OPTIONS = [
  "LIC Policy",
  "Pvt. Life Policy",
  "Health Policy",
  "Motor Policy",
  "Fire Policy",
  "Other Policy",
];

const INVESTMENT_OPTIONS = [
  "Deposits",
  "Mutual Fund",
  "Stock Market",
  "Gold",
  "Property",
  "Other Investment",
];

const LOAN_OPTIONS = [
  "Business Loan",
  "Home Loan",
  "Vehicle Loan",
  "Personal Loan",
  "Gold Loan",
  "Other Loan",
];

const initialInsuranceForm = {
  _id: null,
  type: "",
  submissionDate: "",
  memberName: "",
  insuranceCompany: "",
  policyNumber: "",
  planName: "",
  sumAssured: "",
  mode: "",
  premium: "",
  startDate: "",
  maturityDate: "",
  document: null,
};

const initialInvestmentForm = {
  _id: null,
  type: "",
  submissionDate: "",
  memberName: "",
  financialProduct: "",
  companyName: "",
  planName: "",
  amount: "",
  startDate: "",
  maturityDate: "",
  document: null,
};

const initialLoanForm = {
  _id: null,
  type: "",
  submissionDate: "",
  memberName: "",
  loanType: "",
  companyName: "",
  loanAccountNumber: "",
  outstandingAmount: "",
  interestRate: "",
  term: "",
  startDate: "",
  maturityDate: "",
  document: null,
};

const FinancialInformationFormForProspect = ({ clientId, clientData, onClientCreated }) => {
  const dispatch = useDispatch();
  const { financialInfo, loading, error } = useSelector((state) => state.client || {});

  const [openInsurance, setOpenInsurance] = useState([]);
  const [openInvestments, setOpenInvestments] = useState([]);
  const [openLoans, setOpenLoans] = useState([]);

  const [insuranceForms, setInsuranceForms] = useState([]);
  const [investmentForms, setInvestmentForms] = useState([]);
  const [loanForms, setLoanForms] = useState([]);

  const [insuranceFormData, setInsuranceFormData] = useState({});
  const [investmentFormData, setInvestmentFormData] = useState({});
  const [loanFormData, setLoanFormData] = useState({});

  const [insuranceFiles, setInsuranceFiles] = useState({});
  const [investmentFiles, setInvestmentFiles] = useState({});
  const [loanFiles, setLoanFiles] = useState({});

  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        if (!clientId) return;
        const response = await axiosInstance.get(`/api/client/${clientId}`);
        const result = response.data;
        if (result.success) {
          setFamilyMembers(result.client.familyMembers || []);
          // Prepopulate forms with existing financial info
          if (result.client.financialInfo) {
            setInsuranceForms(result.client.financialInfo.insurance || []);
            setInvestmentForms(result.client.financialInfo.investments || []);
            setLoanForms(result.client.financialInfo.loans || []);
          }
        } else {
          toast.error(result.message || "Failed to load client data.");
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
        toast.error(error.response?.data?.message || "Error loading client data. Check your network.");
      }
    };

    fetchClientData();
  }, [clientId]);

  const handleCheckboxChange = (option, group, existingData = null) => {
    if (group === "insurance") {
      setOpenInsurance((prev) =>
        prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
      );
      setInsuranceFormData((prev) => ({
        ...prev,
        [option]: existingData || { ...initialInsuranceForm, type: option },
      }));
    }
    if (group === "investment") {
      setOpenInvestments((prev) =>
        prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
      );
      setInvestmentFormData((prev) => ({
        ...prev,
        [option]: existingData || { ...initialInvestmentForm, type: option },
      }));
    }
    if (group === "loan") {
      setOpenLoans((prev) =>
        prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
      );
      setLoanFormData((prev) => ({
        ...prev,
        [option]: existingData || { ...initialLoanForm, type: option },
      }));
    }
  };

  const handleFormChange = (option, group, field, value) => {
    if (group === "insurance") {
      setInsuranceFormData((prev) => ({
        ...prev,
        [option]: { ...prev[option], [field]: value },
      }));
    }
    if (group === "investment") {
      setInvestmentFormData((prev) => ({
        ...prev,
        [option]: { ...prev[option], [field]: value },
      }));
    }
    if (group === "loan") {
      setLoanFormData((prev) => ({
        ...prev,
        [option]: { ...prev[option], [field]: value },
      }));
    }
  };

  const handleFileChange = (option, group, files) => {
    if (group === "insurance") {
      setInsuranceFiles((prev) => ({
        ...prev,
        [option]: files ? Array.from(files) : [],
      }));
    }
    if (group === "investment") {
      setInvestmentFiles((prev) => ({
        ...prev,
        [option]: files ? Array.from(files) : [],
      }));
    }
    if (group === "loan") {
      setLoanFiles((prev) => ({
        ...prev,
        [option]: files ? Array.from(files) : [],
      }));
    }
  };

  const handleSaveForm = (option, group) => {
    if (group === "insurance") {
      const formData = { ...insuranceFormData[option] };
      setInsuranceForms((prev) => {
        const existingIndex = prev.findIndex((item) => item._id === formData._id);
        if (existingIndex >= 0) {
          const updatedForms = [...prev];
          updatedForms[existingIndex] = formData;
          return updatedForms;
        }
        return [...prev, formData];
      });
      setOpenInsurance((prev) => prev.filter((v) => v !== option));
      setInsuranceFormData((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
      setInsuranceFiles((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
    }
    if (group === "investment") {
      const formData = { ...investmentFormData[option] };
      setInvestmentForms((prev) => {
        const existingIndex = prev.findIndex((item) => item._id === formData._id);
        if (existingIndex >= 0) {
          const updatedForms = [...prev];
          updatedForms[existingIndex] = formData;
          return updatedForms;
        }
        return [...prev, formData];
      });
      setOpenInvestments((prev) => prev.filter((v) => v !== option));
      setInvestmentFormData((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
      setInvestmentFiles((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
    }
    if (group === "loan") {
      const formData = { ...loanFormData[option] };
      setLoanForms((prev) => {
        const existingIndex = prev.findIndex((item) => item._id === formData._id);
        if (existingIndex >= 0) {
          const updatedForms = [...prev];
          updatedForms[existingIndex] = formData;
          return updatedForms;
        }
        return [...prev, formData];
      });
      setOpenLoans((prev) => prev.filter((v) => v !== option));
      setLoanFormData((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
      setLoanFiles((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
    }
  };

  const handleCloseForm = (option, group) => {
    if (group === "insurance") {
      setOpenInsurance((prev) => prev.filter((v) => v !== option));
      setInsuranceFormData((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
      setInsuranceFiles((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
    }
    if (group === "investment") {
      setOpenInvestments((prev) => prev.filter((v) => v !== option));
      setInvestmentFormData((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
      setInvestmentFiles((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
    }
    if (group === "loan") {
      setOpenLoans((prev) => prev.filter((v) => v !== option));
      setLoanFormData((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
      setLoanFiles((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
    }
  };

  const handleSubmit = async (e, isUpdate = false) => {
    e.preventDefault();

    try {
      const financialData = {
        insurance: insuranceForms,
        investments: investmentForms,
        loans: loanForms,
      };

      const files = {
        insuranceDocuments: Object.values(insuranceFiles).flat(),
        investmentDocuments: Object.values(investmentFiles).flat(),
        loanDocuments: Object.values(loanFiles).flat(),
      };

      const idToUse = clientData?._id || clientId;
      if (!idToUse) {
        toast.error("Client ID is missing.");
        return;
      }

      const action = isUpdate
        ? await dispatch(updateFinancialInfo({ clientId: idToUse, financialData, files }))
        : await dispatch(addFinancialInfo({ clientId: idToUse, financialData, files }));

      if (isUpdate ? updateFinancialInfo.fulfilled.match(action) : addFinancialInfo.fulfilled.match(action)) {
        setInsuranceForms([]);
        setInvestmentForms([]);
        setLoanForms([]);
        setInsuranceFiles({});
        setInvestmentFiles({});
        setLoanFiles({});
        toast.success(action.payload.message);
        if (!isUpdate && onClientCreated && action.payload.clientId) {
          onClientCreated(action.payload.clientId);
        }
      } else {
        toast.error(action.payload || "Failed to save financial information.");
      }
    } catch (error) {
      console.error(`Error ${isUpdate ? "updating" : "adding"} financial data:`, error);
      toast.error(`Failed to ${isUpdate ? "update" : "add"} financial information. Please try again.`);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleEditForm = (item, group) => {
    const option = item.type;
    if (group === "insurance") {
      handleCheckboxChange(option, "insurance", { ...item, document: null });
    }
    if (group === "investment") {
      handleCheckboxChange(option, "investment", { ...item, document: null });
    }
    if (group === "loan") {
      handleCheckboxChange(option, "loan", { ...item, document: null });
    }
  };

  return (
    <Form onSubmit={(e) => handleSubmit(e, false)}>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Insurance</Form.Label>
            {INSURANCE_OPTIONS.map((option) => (
              <Form.Check
                key={option}
                type="checkbox"
                label={option}
                value={option}
                checked={openInsurance.includes(option)}
                onChange={() => handleCheckboxChange(option, "insurance")}
              />
            ))}
          </Form.Group>
          <h6 className="mt-3">Saved Insurance</h6>
          {insuranceForms.map((item, index) => (
            <div key={index} className="border p-2 mb-2">
              <p>{item.type} - {item.memberName} - {item.policyNumber}</p>
              <Button size="sm" onClick={() => handleEditForm(item, "insurance")}>
                Edit
              </Button>
            </div>
          ))}
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Investments</Form.Label>
            {INVESTMENT_OPTIONS.map((option) => (
              <Form.Check
                key={option}
                type="checkbox"
                label={option}
                value={option}
                checked={openInvestments.includes(option)}
                onChange={() => handleCheckboxChange(option, "investment")}
              />
            ))}
          </Form.Group>
          <h6 className="mt-3">Saved Investments</h6>
          {investmentForms.map((item, index) => (
            <div key={index} className="border p-2 mb-2">
              <p>{item.type} - {item.memberName} - {item.financialProduct}</p>
              <Button size="sm" onClick={() => handleEditForm(item, "investment")}>
                Edit
              </Button>
            </div>
          ))}
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Loans</Form.Label>
            {LOAN_OPTIONS.map((option) => (
              <Form.Check
                key={option}
                type="checkbox"
                label={option}
                value={option}
                checked={openLoans.includes(option)}
                onChange={() => handleCheckboxChange(option, "loan")}
              />
            ))}
          </Form.Group>
          <h6 className="mt-3">Saved Loans</h6>
          {loanForms.map((item, index) => (
            <div key={index} className="border p-2 mb-2">
              <p>{item.type} - {item.memberName} - {item.loanAccountNumber}</p>
              <Button size="sm" onClick={() => handleEditForm(item, "loan")}>
                Edit
              </Button>
            </div>
          ))}
        </Col>
      </Row>

      {/* Insurance Forms */}
      {openInsurance.map((option) => (
        <div key={option} className="border p-3 mb-3">
          <h5 className="text-primary">{option} Insurance</h5>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Submission Date</Form.Label>
                <Form.Control
                  type="date"
                  value={insuranceFormData[option]?.submissionDate || getCurrentDate()}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "submissionDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Member Name</Form.Label>
                <Form.Select
                  name="memberName"
                  value={insuranceFormData[option]?.memberName || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "memberName", e.target.value)
                  }
                  required
                >
                  <option value="">Select Member Name</option>
                  {familyMembers.map((member) => (
                    <option key={member._id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Insurance Company</Form.Label>
                <Form.Control
                  type="text"
                  value={insuranceFormData[option]?.insuranceCompany || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "insuranceCompany", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Policy Number</Form.Label>
                <Form.Control
                  type="text"
                  value={insuranceFormData[option]?.policyNumber || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "policyNumber", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Plan Name</Form.Label>
                <Form.Control
                  type="text"
                  value={insuranceFormData[option]?.planName || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "planName", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Sum Assured</Form.Label>
                <Form.Control
                  type="number"
                  value={insuranceFormData[option]?.sumAssured || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "sumAssured", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Mode</Form.Label>
                <Form.Select
                  value={insuranceFormData[option]?.mode || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "mode", e.target.value)
                  }
                  required
                >
                  <option value="">Select Mode</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half Yearly">Half Yearly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Single Premium">Single Premium</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Premium</Form.Label>
                <Form.Control
                  type="number"
                  value={insuranceFormData[option]?.premium || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "premium", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={insuranceFormData[option]?.startDate || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "startDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Maturity Date</Form.Label>
                <Form.Control
                  type="date"
                  value={insuranceFormData[option]?.maturityDate || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "maturityDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Upload Documents (up to 10)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/avif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                  onChange={(e) => handleFileChange(option, "insurance", e.target.files)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant="primary"
            className="me-2 mt-2"
            onClick={() => handleSaveForm(option, "insurance")}
          >
            Save
          </Button>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => handleCloseForm(option, "insurance")}
          >
            Close
          </Button>
        </div>
      ))}

      {/* Investment Forms */}
      {openInvestments.map((option) => (
        <div key={option} className="border p-3 mb-3">
          <h5 className="text-success">{option} Investment</h5>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Submission Date</Form.Label>
                <Form.Control
                  type="date"
                  value={investmentFormData[option]?.submissionDate || getCurrentDate()}
                  onChange={(e) =>
                    handleFormChange(option, "investment", "submissionDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Member Name</Form.Label>
                <Form.Select
                  name="memberName"
                  value={investmentFormData[option]?.memberName || ""}
                  onChange={(e) =>
                    handleFormChange(option, "investment", "memberName", e.target.value)
                  }
                  required
                >
                  <option value="">Select Member Name</option>
                  {familyMembers.map((member) => (
                    <option key={member._id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Financial Product</Form.Label>
                <Form.Control
                  type="text"
                  value={investmentFormData[option]?.financialProduct || ""}
                  onChange={(e) =>
                    handleFormChange(option, "investment", "financialProduct", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  value={investmentFormData[option]?.companyName || ""}
                  onChange={(e) =>
                    handleFormChange(option, "investment", "companyName", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Plan Name</Form.Label>
                <Form.Control
                  type="text"
                  value={investmentFormData[option]?.planName || ""}
                  onChange={(e) =>
                    handleFormChange(option, "investment", "planName", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={investmentFormData[option]?.amount || ""}
                  onChange={(e) =>
                    handleFormChange(option, "investment", "amount", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={investmentFormData[option]?.startDate || ""}
                  onChange={(e) =>
                    handleFormChange(option, "investment", "startDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Maturity Date</Form.Label>
                <Form.Control
                  type="date"
                  value={investmentFormData[option]?.maturityDate || ""}
                  onChange={(e) =>
                    handleFormChange(option, "investment", "maturityDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Upload Documents (up to 10)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/avif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                  onChange={(e) => handleFileChange(option, "investment", e.target.files)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant="primary"
            className="me-2 mt-2"
            onClick={() => handleSaveForm(option, "investment")}
          >
            Save
          </Button>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => handleCloseForm(option, "investment")}
          >
            Close
          </Button>
        </div>
      ))}

      {/* Loan Forms */}
      {openLoans.map((option) => (
        <div key={option} className="border p-3 mb-3">
          <h5 className="text-danger">{option} Loan</h5>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Submission Date</Form.Label>
                <Form.Control
                  type="date"
                  value={loanFormData[option]?.submissionDate || getCurrentDate()}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "submissionDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Member Name</Form.Label>
                <Form.Select
                  name="memberName"
                  value={loanFormData[option]?.memberName || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "memberName", e.target.value)
                  }
                  required
                >
                  <option value="">Select Member Name</option>
                  {familyMembers.map((member) => (
                    <option key={member._id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Loan Type</Form.Label>
                <Form.Control
                  type="text"
                  value={loanFormData[option]?.loanType || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "loanType", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  value={loanFormData[option]?.companyName || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "companyName", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Loan Account Number</Form.Label>
                <Form.Control
                  type="text"
                  value={loanFormData[option]?.loanAccountNumber || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "loanAccountNumber", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Outstanding Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={loanFormData[option]?.outstandingAmount || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "outstandingAmount", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Interest Rate (%)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={loanFormData[option]?.interestRate || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "interestRate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Term</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 5 years, 60 months"
                  value={loanFormData[option]?.term || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "term", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={loanFormData[option]?.startDate || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "startDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Maturity Date</Form.Label>
                <Form.Control
                  type="date"
                  value={loanFormData[option]?.maturityDate || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "maturityDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Upload Documents (up to 10)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/avif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                  onChange={(e) => handleFileChange(option, "loan", e.target.files)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant="primary"
            className="me-2 mt-2"
            onClick={() => handleSaveForm(option, "loan")}
          >
            Save
          </Button>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => handleCloseForm(option, "loan")}
          >
            Close
          </Button>
        </div>
      ))}

      <Button type="submit" className="btn btn-primary mt-3 me-2">
        Add Financial Info
      </Button>
      <Button
        type="button"
        className="btn btn-primary mt-3"
        onClick={(e) => handleSubmit(e, true)}
      >
        Update Financial Info
      </Button>
    </Form>
  );
};

export default FinancialInformationFormForProspect