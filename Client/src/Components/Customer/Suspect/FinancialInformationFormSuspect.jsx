


// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { Form, Row, Col, Button } from "react-bootstrap";
// import { addFinancialInfo } from "../../../redux/feature/SuspectRedux/SuspectThunx";
// import {toast} from "react-toastify"

// const INSURANCE_OPTIONS = [
//   "LIC Policy",
//   "Pvt. Life Policy",
//   "Health Policy",
//   "Motor Policy",
//   "Fire Policy",
//   "Other Policy",
// ];

// const INVESTMENT_OPTIONS = [
//   "Deposits",
//   "Mutual Fund",
//   "Stock Market",
//   "Gold",
//   "Property",
//   "Other Investment",
// ];

// const LOAN_OPTIONS = [
//   "Business Loan",
//   "Home Loan",
//   "Vehicle Loan",
//   "Personal Loan",
//   "Gold Loan",
//   "Other Loan",
// ];

// const initialInsuranceForm = {
//   type: "",
//   submissionDate: "",
//   memberName: "",
//   insuranceCompany: "",
//   policyNumber: "",
//   planName: "",
//   sumAssured: "",
//   mode: "",
//   premium: "",
//   startDate: "",
//   maturityDate: "",
//   document: null,
// };

// const initialInvestmentForm = {
//   type: "",
//   submissionDate: "",
//   memberName: "",
//   financialProduct: "",
//   companyName: "",
//   planName: "",
//   amount: "",
//   startDate: "",
//   maturityDate: "",
//   document: null,
// };

// const initialLoanForm = {
//   type: "",
//   submissionDate: "",
//   memberName: "",
//   loanType: "",
//   companyName: "",
//   loanAccountNumber: "",
//   outstandingAmount: "",
//   interestRate: "",
//   term: "",
//   startDate: "",
//   maturityDate: "",
//   document: null,
// };

// const FinancialInformationFormForSuspect = ({ suspectId, suspectData, onSuspectCreated }) => {
//   const dispatch = useDispatch();

//   const [openInsurance, setOpenInsurance] = useState([]);
//   const [openInvestments, setOpenInvestments] = useState([]);
//   const [openLoans, setOpenLoans] = useState([]);

//   const [insuranceForms, setInsuranceForms] = useState([]);
//   const [investmentForms, setInvestmentForms] = useState([]);
//   const [loanForms, setLoanForms] = useState([]);

//   const [insuranceFormData, setInsuranceFormData] = useState({});
//   const [investmentFormData, setInvestmentFormData] = useState({});
//   const [loanFormData, setLoanFormData] = useState({});





//   const handleCheckboxChange = (option, group) => {
//     if (group === "insurance") {
//       setOpenInsurance((prev) =>
//         prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
//       );
//       setInsuranceFormData((prev) => ({
//         ...prev,
//         [option]: { ...initialInsuranceForm, type: option },
//       }));
//     }
//     if (group === "investment") {
//       setOpenInvestments((prev) =>
//         prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
//       );
//       setInvestmentFormData((prev) => ({
//         ...prev,
//         [option]: { ...initialInvestmentForm, type: option },
//       }));
//     }
//     if (group === "loan") {
//       setOpenLoans((prev) =>
//         prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
//       );
//       setLoanFormData((prev) => ({
//         ...prev,
//         [option]: { ...initialLoanForm, type: option },
//       }));
//     }
//   };

//   const handleFormChange = (option, group, field, value) => {
//     if (group === "insurance") {
//       setInsuranceFormData((prev) => ({
//         ...prev,
//         [option]: { ...prev[option], [field]: value },
//       }));
//     }
//     if (group === "investment") {
//       setInvestmentFormData((prev) => ({
//         ...prev,
//         [option]: { ...prev[option], [field]: value },
//       }));
//     }
//     if (group === "loan") {
//       setLoanFormData((prev) => ({
//         ...prev,
//         [option]: { ...prev[option], [field]: value },
//       }));
//     }
//   };


  
//   const handleSaveForm = (option, group) => {
//     if (group === "insurance") {
//       const formData = { ...insuranceFormData[option] };
//       if (!formData.document) {
//         formData.document = null;
//       }
//       setInsuranceForms((prev) => [...prev, formData]);
//       setOpenInsurance((prev) => prev.filter((v) => v !== option));
//       setInsuranceFormData((prev) => {
//         const copy = { ...prev };
//         delete copy[option];
//         return copy;
//       });
//     }
//     if (group === "investment") {
//       const formData = { ...investmentFormData[option] };
//       if (!formData.document) {
//         formData.document = null;
//       }
//       setInvestmentForms((prev) => [...prev, formData]);
//       setOpenInvestments((prev) => prev.filter((v) => v !== option));
//       setInvestmentFormData((prev) => {
//         const copy = { ...prev };
//         delete copy[option];
//         return copy;
//       });
//     }
//     if (group === "loan") {
//       const formData = { ...loanFormData[option] };
//       if (!formData.document) {
//         formData.document = null;
//       }
//       setLoanForms((prev) => [...prev, formData]);
//       setOpenLoans((prev) => prev.filter((v) => v !== option));
//       setLoanFormData((prev) => {
//         const copy = { ...prev };
//         delete copy[option];
//         return copy;
//       });
//     }
//   };

//   const handleCloseForm = (option, group) => {
//     if (group === "insurance") {
//       setOpenInsurance((prev) => prev.filter((v) => v !== option));
//       setInsuranceFormData((prev) => {
//         const copy = { ...prev };
//         delete copy[option];
//         return copy;
//       });
//     }
//     if (group === "investment") {
//       setOpenInvestments((prev) => prev.filter((v) => v !== option));
//       setInvestmentFormData((prev) => {
//         const copy = { ...prev };
//         delete copy[option];
//         return copy;
//       });
//     }
//     if (group === "loan") {
//       setOpenLoans((prev) => prev.filter((v) => v !== option));
//       setLoanFormData((prev) => {
//         const copy = { ...prev };
//         delete copy[option];
//         return copy;
//       });
//     }
//   };

//   // const handleFileChange = (option, group, file) => {
//   //   handleFormChange(option, group, "document", file);
//   // };

//   const handleFileChange = (option, group, file) => {
//   if (file) {
//     handleFormChange(option, group, "document", file);
//   } else {
//     handleFormChange(option, group, "document", null);
//   }
// };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const financialData = {
//       insurance: insuranceForms,
//       investments: investmentForms,
//       loans: loanForms,
//     };
    
//     const idToUse = suspectData && suspectData._id || suspectId;
  
//     const result = await dispatch(addFinancialInfo({ suspectId:idToUse, financialData }));
//     if(result){
//     setInsuranceForms([]);
//     setInvestmentForms([]);
//     setLoanForms([]);
//     toast.info("Financial Information Added Successfully....")
//     const suspectIdFromRedux = result?.payload;
//     if (onSuspectCreated && suspectIdFromRedux) onSuspectCreated(suspectIdFromRedux);
//     }
//   };

//   return (
//     <Form onSubmit={handleSubmit}>
//       <Row className="mb-3">
//         <Col md={4}>
//           <Form.Group>
//             <Form.Label>Insurance</Form.Label>
//             {INSURANCE_OPTIONS.map((option) => (
//               <Form.Check
//                 key={option}
//                 type="checkbox"
//                 label={option}
//                 value={option}
//                 checked={openInsurance.includes(option)}
//                 onChange={() => handleCheckboxChange(option, "insurance")}
//               />
//             ))}
//           </Form.Group>
//         </Col>
//         <Col md={4}>
//           <Form.Group>
//             <Form.Label>Investments</Form.Label>
//             {INVESTMENT_OPTIONS.map((option) => (
//               <Form.Check
//                 key={option}
//                 type="checkbox"
//                 label={option}
//                 value={option}
//                 checked={openInvestments.includes(option)}
//                 onChange={() => handleCheckboxChange(option, "investment")}
//               />
//             ))}
//           </Form.Group>
//         </Col>
//         <Col md={4}>
//           <Form.Group>
//             <Form.Label>Loans</Form.Label>
//             {LOAN_OPTIONS.map((option) => (
//               <Form.Check
//                 key={option}
//                 type="checkbox"
//                 label={option}
//                 value={option}
//                 checked={openLoans.includes(option)}
//                 onChange={() => handleCheckboxChange(option, "loan")}
//               />
//             ))}
//           </Form.Group>
//         </Col>
//       </Row>

//       {/* Insurance Forms */}
//       {openInsurance.map((option) => (
//         <div key={option} className="border p-3 mb-3">
//           <h5 className="text-primary">{option} Insurance</h5>
//           <Row>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Submission Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={insuranceFormData[option]?.submissionDate || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "insurance", "submissionDate", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Member Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={insuranceFormData[option]?.memberName || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "insurance", "memberName", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Insurance Company</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={insuranceFormData[option]?.insuranceCompany || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "insurance", "insuranceCompany", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Policy Number</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={insuranceFormData[option]?.policyNumber || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "insurance", "policyNumber", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Plan Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={insuranceFormData[option]?.planName || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "insurance", "planName", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Sum Assured</Form.Label>
//                 <Form.Control
//                   type="number"
//                   value={insuranceFormData[option]?.sumAssured || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "insurance", "sumAssured", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Mode</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={insuranceFormData[option]?.mode || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "insurance", "mode", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Premium</Form.Label>
//                 <Form.Control
//                   type="number"
//                   value={insuranceFormData[option]?.premium || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "insurance", "premium", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Start Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={insuranceFormData[option]?.startDate || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "insurance", "startDate", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Maturity Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={insuranceFormData[option]?.maturityDate || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "insurance", "maturityDate", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             {/* <Col md={6}>
//               <Form.Group>
//                 <Form.Label>Upload Document</Form.Label>
//                 <Form.Control
//                   type="file"
//                   onChange={(e) =>
//                     handleFileChange(option, "insurance", e.target.files[0])
//                   }
//                 />
//               </Form.Group>
//             </Col> */}
//             <Col md={6}>
//   <Form.Group>
//     <Form.Label>Upload Document</Form.Label>
//     <Form.Control
//       type="file"
//       onChange={(e) => {
//         if (e.target.files && e.target.files.length > 0) {
//           handleFileChange(option, "insurance", e.target.files[0]);
//         } else {
//           handleFileChange(option, "insurance", null);
//         }
//       }}
//     />
//   </Form.Group>
// </Col>
//           </Row>
//           <Button
//             variant="primary"
//             className="me-2 mt-2"
//             onClick={() => handleSaveForm(option, "insurance")}
//           >
//             Save
//           </Button>
//           <Button
//             variant="secondary"
//             className="mt-2"
//             onClick={() => handleCloseForm(option, "insurance")}
//           >
//             Close
//           </Button>
//         </div>
//       ))}

//       {/* Investment Forms */}
//       {openInvestments.map((option) => (
//         <div key={option} className="border p-3 mb-3">
//           <h5 className="text-success">{option} Investment</h5>
//           <Row>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Submission Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={investmentFormData[option]?.submissionDate || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "investment", "submissionDate", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Member Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={investmentFormData[option]?.memberName || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "investment", "memberName", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Financial Product</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={investmentFormData[option]?.financialProduct || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "investment", "financialProduct", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Company Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={investmentFormData[option]?.companyName || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "investment", "companyName", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Plan Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={investmentFormData[option]?.planName || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "investment", "planName", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Amount</Form.Label>
//                 <Form.Control
//                   type="number"
//                   value={investmentFormData[option]?.amount || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "investment", "amount", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Start Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={investmentFormData[option]?.startDate || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "investment", "startDate", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Maturity Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={investmentFormData[option]?.maturityDate || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "investment", "maturityDate", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             {/* <Col md={6}>
//               <Form.Group>
//                 <Form.Label>Upload Document</Form.Label>
//                 <Form.Control
//                   type="file"
//                   onChange={(e) =>
//                     handleFileChange(option, "investment", e.target.files[0])
//                   }
//                 />
//               </Form.Group>
//             </Col> */}
//             <Col md={6}>
//   <Form.Group>
//     <Form.Label>Upload Document</Form.Label>
//     <Form.Control
//       type="file"
//       onChange={(e) => {
//         if (e.target.files && e.target.files.length > 0) {
//           handleFileChange(option, "investment", e.target.files[0]);
//         } else {
//           handleFileChange(option, "investment", null);
//         }
//       }}
//     />
//   </Form.Group>
// </Col>
//           </Row>
//           <Button
//             variant="primary"
//             className="me-2 mt-2"
//             onClick={() => handleSaveForm(option, "investment")}
//           >
//             Save
//           </Button>
//           <Button
//             variant="secondary"
//             className="mt-2"
//             onClick={() => handleCloseForm(option, "investment")}
//           >
//             Close
//           </Button>
//         </div>
//       ))}

//       {/* Loan Forms */}
//       {openLoans.map((option) => (
//         <div key={option} className="border p-3 mb-3">
//           <h5 className="text-danger">{option} Loan</h5>
//           <Row>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Submission Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={loanFormData[option]?.submissionDate || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "loan", "submissionDate", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Member Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={loanFormData[option]?.memberName || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "loan", "memberName", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Loan Type</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={loanFormData[option]?.loanType || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "loan", "loanType", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Company Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={loanFormData[option]?.companyName || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "loan", "companyName", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Loan Account Number</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={loanFormData[option]?.loanAccountNumber || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "loan", "loanAccountNumber", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Outstanding Amount</Form.Label>
//                 <Form.Control
//                   type="number"
//                   value={loanFormData[option]?.outstandingAmount || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "loan", "outstandingAmount", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Interest Rate (%)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   value={loanFormData[option]?.interestRate || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "loan", "interestRate", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Term</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={loanFormData[option]?.term || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "loan", "term", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Start Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={loanFormData[option]?.startDate || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "loan", "startDate", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Maturity Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={loanFormData[option]?.maturityDate || ""}
//                   onChange={(e) =>
//                     handleFormChange(option, "loan", "maturityDate", e.target.value)
//                   }
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             {/* <Col md={6}>
//               <Form.Group>
//                 <Form.Label>Upload Document</Form.Label>
//                 <Form.Control
//                   type="file"
//                   onChange={(e) =>
//                     handleFileChange(option, "loan", e.target.files[0])
//                   }
//                 />
//               </Form.Group>
//             </Col> */}

//             <Col md={6}>
//   <Form.Group>
//     <Form.Label>Upload Document</Form.Label>
//     <Form.Control
//       type="file"
//       onChange={(e) => {
//         if (e.target.files && e.target.files.length > 0) {
//           handleFileChange(option, "loan", e.target.files[0]);
//         } else {
//           handleFileChange(option, "loan", null);
//         }
//       }}
//     />
//   </Form.Group>
// </Col>

//           </Row>
//           <Button
//             variant="primary"
//             className="me-2 mt-2"
//             onClick={() => handleSaveForm(option, "loan")}
//           >
//             Save
//           </Button>
//           <Button
//             variant="secondary"
//             className="mt-2"
//             onClick={() => handleCloseForm(option, "loan")}
//           >
//             Close
//           </Button>
//         </div>
//       ))}

//       <Button type="submit" className="btn btn-primary">
//         Submit All
//       </Button>
//     </Form>
//   );
// };

// export default FinancialInformationFormForSuspect;
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import { addFinancialInfo } from "../../../redux/feature/SuspectRedux/SuspectThunx";
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

const FinancialInformationFormForSuspect = ({ suspectId, suspectData, onSuspectCreated }) => {
  const dispatch = useDispatch();

  const [openInsurance, setOpenInsurance] = useState([]);
  const [openInvestments, setOpenInvestments] = useState([]);
  const [openLoans, setOpenLoans] = useState([]);

  const [insuranceForms, setInsuranceForms] = useState([]);
  const [investmentForms, setInvestmentForms] = useState([]);
  const [loanForms, setLoanForms] = useState([]);

  const [insuranceFormData, setInsuranceFormData] = useState({});
  const [investmentFormData, setInvestmentFormData] = useState({});
  const [loanFormData, setLoanFormData] = useState({});

  const handleCheckboxChange = (option, group) => {
    if (group === "insurance") {
      setOpenInsurance((prev) =>
        prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
      );
      setInsuranceFormData((prev) => ({
        ...prev,
        [option]: { ...initialInsuranceForm, type: option },
      }));
    }
    if (group === "investment") {
      setOpenInvestments((prev) =>
        prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
      );
      setInvestmentFormData((prev) => ({
        ...prev,
        [option]: { ...initialInvestmentForm, type: option },
      }));
    }
    if (group === "loan") {
      setOpenLoans((prev) =>
        prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
      );
      setLoanFormData((prev) => ({
        ...prev,
        [option]: { ...initialLoanForm, type: option },
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

  const handleFileChange = (option, group, file) => {
    if (file) {
      handleFormChange(option, group, "document", file);
    } else {
      handleFormChange(option, group, "document", null);
    }
  };

  const handleSaveForm = (option, group) => {
    if (group === "insurance") {
      const formData = { ...insuranceFormData[option] };
      // Validate required fields
      if (
        !formData.submissionDate ||
        !formData.memberName ||
        !formData.insuranceCompany ||
        !formData.policyNumber ||
        !formData.planName ||
        !formData.sumAssured ||
        !formData.mode ||
        !formData.premium ||
        !formData.startDate ||
        !formData.maturityDate
      ) {
        toast.error("Please fill in all required fields for the insurance form");
        return;
      }
      if (!formData.document) {
        toast.error("Please upload a document for the insurance form");
        return;
      }
      setInsuranceForms((prev) => [...prev, formData]);
      setOpenInsurance((prev) => prev.filter((v) => v !== option));
      setInsuranceFormData((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
      toast.success(`${option} insurance saved successfully`);
    }
    if (group === "investment") {
      const formData = { ...investmentFormData[option] };
      if (
        !formData.submissionDate ||
        !formData.memberName ||
        !formData.financialProduct ||
        !formData.companyName ||
        !formData.planName ||
        !formData.amount ||
        !formData.startDate ||
        !formData.maturityDate
      ) {
        toast.error("Please fill in all required fields for the investment form");
        return;
      }
      if (!formData.document) {
        toast.error("Please upload a document for the investment form");
        return;
      }
      setInvestmentForms((prev) => [...prev, formData]);
      setOpenInvestments((prev) => prev.filter((v) => v !== option));
      setInvestmentFormData((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
      toast.success(`${option} investment saved successfully`);
    }
    if (group === "loan") {
      const formData = { ...loanFormData[option] };
      if (
        !formData.submissionDate ||
        !formData.memberName ||
        !formData.loanType ||
        !formData.companyName ||
        !formData.loanAccountNumber ||
        !formData.outstandingAmount ||
        !formData.interestRate ||
        !formData.term ||
        !formData.startDate ||
        !formData.maturityDate
      ) {
        toast.error("Please fill in all required fields for the loan form");
        return;
      }
      if (!formData.document) {
        toast.error("Please upload a document for the loan form");
        return;
      }
      setLoanForms((prev) => [...prev, formData]);
      setOpenLoans((prev) => prev.filter((v) => v !== option));
      setLoanFormData((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
      toast.success(`${option} loan saved successfully`);
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
    }
    if (group === "investment") {
      setOpenInvestments((prev) => prev.filter((v) => v !== option));
      setInvestmentFormData((prev) => {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (insuranceForms.length === 0 && investmentForms.length === 0 && loanForms.length === 0) {
      toast.error("Please save at least one form (insurance, investment, or loan) before submitting");
      return;
    }

    try {
      const idToUse = suspectData && suspectData._id ? suspectData._id : suspectId;

      // Process insurance forms
      for (const form of insuranceForms) {
        const formData = new FormData();
        formData.append("type", form.type);
        formData.append("submissionDate", form.submissionDate);
        formData.append("memberName", form.memberName);
        formData.append("insuranceCompany", form.insuranceCompany);
        formData.append("policyNumber", form.policyNumber);
        formData.append("planName", form.planName);
        formData.append("sumAssured", form.sumAssured);
        formData.append("mode", form.mode);
        formData.append("premium", form.premium);
        formData.append("startDate", form.startDate);
        formData.append("maturityDate", form.maturityDate);
        if (form.document) {
          formData.append("document", form.document);
        }

        await dispatch(addFinancialInfo({ suspectId: idToUse, financialData: formData }));
      }

      // Process investment forms
      for (const form of investmentForms) {
        const formData = new FormData();
        formData.append("type", form.type);
        formData.append("submissionDate", form.submissionDate);
        formData.append("memberName", form.memberName);
        formData.append("financialProduct", form.financialProduct);
        formData.append("companyName", form.companyName);
        formData.append("planName", form.planName);
        formData.append("amount", form.amount);
        formData.append("startDate", form.startDate);
        formData.append("maturityDate", form.maturityDate);
        if (form.document) {
          formData.append("document", form.document);
        }

        await dispatch(addFinancialInfo({ suspectId: idToUse, financialData: formData }));
      }

      // Process loan forms
      for (const form of loanForms) {
        const formData = new FormData();
        formData.append("type", form.type);
        formData.append("submissionDate", form.submissionDate);
        formData.append("memberName", form.memberName);
        formData.append("loanType", form.loanType);
        formData.append("companyName", form.companyName);
        formData.append("loanAccountNumber", form.loanAccountNumber);
        formData.append("outstandingAmount", form.outstandingAmount);
        formData.append("interestRate", form.interestRate);
        formData.append("term", form.term);
        formData.append("startDate", form.startDate);
        formData.append("maturityDate", form.maturityDate);
        if (form.document) {
          formData.append("document", form.document);
        }

        await dispatch(addFinancialInfo({ suspectId: idToUse, financialData: formData }));
      }

      // Reset forms after successful submission
      setInsuranceForms([]);
      setInvestmentForms([]);
      setLoanForms([]);
      toast.success("Financial Information Added Successfully!");
      const suspectIdFromRedux = idToUse; // Assuming the suspectId is returned or reused
      if (onSuspectCreated && suspectIdFromRedux) {
        onSuspectCreated(suspectIdFromRedux);
      }
    } catch (error) {
      toast.error("Failed to submit financial information. Please try again.");
      console.error("Submit error:", error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
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
        </Col>
      </Row>

      {/* Insurance Forms */}
      {openInsurance.map((option) => (
        <div key={option} className="border p-3 mb-3">
          <h5 className="text-primary">{option} Insurance</h5>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Submission Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  value={insuranceFormData[option]?.submissionDate || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "submissionDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Member Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={insuranceFormData[option]?.memberName || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "memberName", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Insurance Company <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Policy Number <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Plan Name <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Sum Assured <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Mode <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={insuranceFormData[option]?.mode || ""}
                  onChange={(e) =>
                    handleFormChange(option, "insurance", "mode", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Premium <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Maturity Date <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Upload Document <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(option, "insurance", e.target.files[0]);
                    } else {
                      handleFileChange(option, "insurance", null);
                    }
                  }}
                  required
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
                <Form.Label>Submission Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  value={investmentFormData[option]?.submissionDate || ""}
                  onChange={(e) =>
                    handleFormChange(option, "investment", "submissionDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Member Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={investmentFormData[option]?.memberName || ""}
                  onChange={(e) =>
                    handleFormChange(option, "investment", "memberName", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Financial Product <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Plan Name <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Amount <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Maturity Date <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Upload Document <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(option, "investment", e.target.files[0]);
                    } else {
                      handleFileChange(option, "investment", null);
                    }
                  }}
                  required
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
                <Form.Label>Submission Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  value={loanFormData[option]?.submissionDate || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "submissionDate", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Member Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={loanFormData[option]?.memberName || ""}
                  onChange={(e) =>
                    handleFormChange(option, "loan", "memberName", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Loan Type <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Loan Account Number <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Outstanding Amount <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Interest Rate (%) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
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
                <Form.Label>Term <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
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
                <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Maturity Date <span className="text-danger">*</span></Form.Label>
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
                <Form.Label>Upload Document <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(option, "loan", e.target.files[0]);
                    } else {
                      handleFileChange(option, "loan", null);
                    }
                  }}
                  required
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

      <Button
        type="submit"
        className="btn btn-primary"
        disabled={insuranceForms.length === 0 && investmentForms.length === 0 && loanForms.length === 0}
      >
        Submit All ({insuranceForms.length + investmentForms.length + loanForms.length})
      </Button>
    </Form>
  );
};

export default FinancialInformationFormForSuspect;