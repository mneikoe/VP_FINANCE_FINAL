

// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Form, Row, Col, Button } from "react-bootstrap";
// import { createProspect, updateProspectPersonalDetails } from "../../../redux/feature/ProspectRedux/ProspectThunx";
// import { fetchDetails } from "../../../redux/feature/LeadSource/LeadThunx";
// import { getAllOccupations } from "../../../redux/feature/LeadOccupation/OccupationThunx";
// import { getAllOccupationTypes } from "../../../redux/feature/OccupationType/OccupationThunx";
// import { toast } from "react-toastify";

// const incomeOptions = [
//   { value: "25 lakh to 1 Cr.", label: "25 lakh to 1 Cr." },
//   { value: "5 to 25 lakh", label: "5 to 25 lakh" },
//   { value: "2.5 to 5 lakh", label: "2.5 to 5 lakh" },
// ];

// const gradeMap = {
//   "25 lakh to 1 Cr.": 1,
//   "5 to 25 lakh": 2,
//   "2.5 to 5 lakh": 3,
// };

// const PersonalDetailsFormForProspect = ({ isEdit, prospectData, onProspectCreated }) => {
//   const dispatch = useDispatch();
//   const initialFormState = {
//     salutation: "",
//     groupName: "",
//     gender: "",
//     organisation: "",
//     designation: "",
//     mobileNo: "",
//     contactNo: "",
//     whatsappNo: "",
//     emailId: "",
//     paName: "",
//     paMobileNo: "",
//     annualIncome: "",
//     grade: "",
//     preferredAddressType: "resi",
//     resiAddr: "",
//     resiLandmark: "",
//     resiPincode: "",
//     officeAddr: "",
//     officeLandmark: "",
//     officePincode: "",
//     preferredMeetingAddr: "",
//     preferredMeetingArea: "",
//     city: "",
//     bestTime: "",
//     adharNumber: "",
//     panCardNumber: "",
//     hobbies: "",
//     nativePlace: "",
//     socialLink: "",
//     habits: "",
//     leadSource: "",
//     leadName: "",
//     leadOccupation: "",
//     leadOccupationType: "",
//     callingPurpose: "",
//     name: "",
//     allocatedCRE: "",
//     remark: "",
//   };

//   const [formData, setFormData] = useState(initialFormState);
//   const { leadsourceDetail } = useSelector((state) => state.leadsource);
//   const { alldetails } = useSelector((state) => state.leadOccupation);
//   const { alldetailsForTypes } = useSelector((state) => state.OccupationType);

//   useEffect(() => {
//     dispatch(fetchDetails());
//     dispatch(getAllOccupationTypes());
//     dispatch(getAllOccupations());
//   }, [dispatch]);

//   useEffect(() => {
//     if (isEdit && prospectData) {
//       setFormData(prospectData.personalDetails);
//     } else {
//       setFormData(initialFormState);
//     }
//   }, [isEdit, prospectData]);

//   useEffect(() => {
//     setFormData((prev) => ({
//       ...prev,
//       grade: gradeMap[prev.annualIncome] || "",
//     }));
//   }, [formData.annualIncome]);

//   useEffect(() => {
//     if (formData.preferredAddressType === "resi") {
//       setFormData((prev) => ({
//         ...prev,
//         preferredMeetingAddr: prev.resiAddr,
//       }));
//     } else if (formData.preferredAddressType === "office") {
//       setFormData((prev) => ({
//         ...prev,
//         preferredMeetingAddr: prev.officeAddr,
//       }));
//     }
//   }, [formData.preferredAddressType, formData.resiAddr, formData.officeAddr]);

//   const fetchAreaData = async (pincode) => {
//     try {
//       const response = await fetch(`/api/leadarea?pincode=${pincode}`);
//       const data = await response.json();
//       console.log("API Response:", data);

//       if (data && Array.isArray(data)) {
//         const area = data.find((item) => String(item.pincode) === String(pincode));

//         if (area) {
//           setFormData((prev) => ({
//             ...prev,
//             preferredMeetingArea: area.name || "",
//             city: area.city || "",
//           }));
//         } else {
//           setFormData((prev) => ({
//             ...prev,
//             preferredMeetingArea: "Area not found",
//             city: "",
//           }));
//         }
//       } else {
//         setFormData((prev) => ({
//           ...prev,
//           preferredMeetingArea: "No data received",
//           city: "",
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching area data:", error);
//       setFormData((prev) => ({
//         ...prev,
//         preferredMeetingArea: "Error fetching area",
//         city: "",
//       }));
//     }
//   };

//   useEffect(() => {
//     if (formData.resiPincode?.length === 6 || formData.officePincode?.length === 6) {
//       fetchAreaData(formData.resiPincode || formData.officePincode);
//     }
//   }, [formData.resiPincode, formData.officePincode]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if ((name === "resiPincode" || name === "officePincode") && value.length === 6) {
//       fetchAreaData(value);
//     }
//   };

//   const handleAddressTypeChange = (type) => {
//     setFormData((prev) => ({
//       ...prev,
//       preferredAddressType: type,
//       preferredMeetingAddr: type === "resi" ? prev.resiAddr : prev.officeAddr,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (isEdit && prospectData?._id) {
//       console.log(formData);
//       const result = await dispatch(updateProspectPersonalDetails({ id: prospectData._id, personalDetails: formData }));
//       if (result) {
//         setFormData(initialFormState);
//         toast.info("Prospect details updated successfully");
//         if (onProspectCreated) onProspectCreated(prospectData._id);
//       }
//     } else {
//       const resultAction = await dispatch(createProspect({ personalDetails: formData }));
//       if (resultAction) {
//         toast.success("Prospect Created Successfully");
//         setFormData(initialFormState);
//         const prospectId = resultAction?.payload;
//         if (onProspectCreated && prospectId) onProspectCreated(prospectId);
//       }
//     }
//   };

//   return (
//     <Form onSubmit={handleSubmit}>
//       <Row className="mb-4">
//         <Col md={2}>
//           <Form.Group controlId="salutation">
//             <Form.Label>Salutation</Form.Label>
//             <Form.Select
//               name="salutation"
//               value={formData.salutation ?? ""}
//               onChange={handleChange}
//               size="sm"
//             >
//               <option value="">Select</option>
//               <option>Mr.</option>
//               <option>Mrs.</option>
//               <option>Ms.</option>
//               <option>Mast.</option>
//               <option>Shri.</option>
//               <option>Smt.</option>
//               <option>Kum.</option>
//               <option>Kr.</option>
//               <option>Dr.</option>
//             </Form.Select>
//           </Form.Group>
//         </Col>
//         <Col md={5}>
//           <Form.Group controlId="groupName">
//             <Form.Label>Group Head</Form.Label>
//             <Form.Control
//               name="groupName"
//               type="text"
//               placeholder="Group Head"
//               value={formData.groupName ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="gender">
//             <Form.Label>Gender</Form.Label>
//             <Form.Select
//               name="gender"
//               value={formData.gender ?? ""}
//               onChange={handleChange}
//               size="sm"
//             >
//               <option value="">Select</option>
//               <option>Male</option>
//               <option>Female</option>
//             </Form.Select>
//           </Form.Group>
//         </Col>
//       </Row>
//       <Row className="mb-4">
//         <Col md={4}>
//           <Form.Group controlId="organisation">
//             <Form.Label>Organisation</Form.Label>
//             <Form.Control
//               name="organisation"
//               type="text"
//               placeholder="Organisation"
//               value={formData.organisation ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={4}>
//           <Form.Group controlId="designation">
//             <Form.Label>Designation</Form.Label>
//             <Form.Control
//               name="designation"
//               type="text"
//               placeholder="Designation"
//               value={formData.designation ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="annualIncome">
//             <Form.Label style={{ color: "#00008B" }} className="fw-medium">
//               Annual Income
//             </Form.Label>
//             <Form.Select
//               name="annualIncome"
//               value={formData.annualIncome ?? ""}
//               onChange={handleChange}
//               size="sm"
//             >
//               <option value="">-- Select --</option>
//               {incomeOptions.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </Form.Select>
//           </Form.Group>
//         </Col>
//         <Col md={1}>
//           <Form.Group controlId="grade">
//             <Form.Label style={{ color: "#00008B" }} className="fw-medium">
//               Grade
//             </Form.Label>
//             <Form.Control
//               type="text"
//               name="grade"
//               value={formData.grade ?? ""}
//               size="sm"
//               readOnly
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//       <Row className="mb-4">
//         <Col md={3}>
//           <Form.Group controlId="mobileNo">
//             <Form.Label>Mobile No</Form.Label>
//             <Form.Control
//               name="mobileNo"
//               type="text"
//               placeholder="Mobile No"
//               value={formData.mobileNo ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="whatsappNo">
//             <Form.Label>Whatsapp No</Form.Label>
//             <Form.Control
//               name="whatsappNo"
//               type="text"
//               placeholder="Whatsapp No"
//               value={formData.whatsappNo ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="contactNo">
//             <Form.Label>Contact No</Form.Label>
//             <Form.Control
//               name="contactNo"
//               type="text"
//               placeholder="Contact No"
//               value={formData.contactNo ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="emailId">
//             <Form.Label>Email Id</Form.Label>
//             <Form.Control
//               name="emailId"
//               type="email"
//               placeholder="Email Id"
//               value={formData.emailId ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//       <Row className="mb-4">
//         <Col md={3}>
//           <Form.Group controlId="paName">
//             <Form.Label>PA Name</Form.Label>
//             <Form.Control
//               name="paName"
//               type="text"
//               placeholder="PA Name"
//               value={formData.paName ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="paMobileNo">
//             <Form.Label>PA Mobile No</Form.Label>
//             <Form.Control
//               name="paMobileNo"
//               type="text"
//               placeholder="PA Mobile No"
//               value={formData.paMobileNo ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="adharNumber">
//             <Form.Label>Aadhar No</Form.Label>
//             <Form.Control
//               name="adharNumber"
//               type="text"
//               placeholder="Aadhar Number"
//               value={formData.adharNumber ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="panCardNumber">
//             <Form.Label>PAN Card No</Form.Label>
//             <Form.Control
//               name="panCardNumber"
//               type="text"
//               placeholder="PAN Card Number"
//               value={formData.panCardNumber ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//       <Row className="mb-4">
//         <Col md={1} className="mt-2">
//           <Form.Check
//             type="radio"
//             label="Residential"
//             name="preferredAddressType"
//             checked={formData.preferredAddressType === "resi"}
//             onChange={() => handleAddressTypeChange("resi")}
//           />
//         </Col>
//         <Col md={6}>
//           <Form.Group controlId="resiAddr">
//             <Form.Label>Address</Form.Label>
//             <Form.Control
//               name="resiAddr"
//               type="text"
//               placeholder="Residential Address"
//               value={formData.resiAddr ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="resiLandmark">
//             <Form.Label>Landmark</Form.Label>
//             <Form.Control
//               name="resiLandmark"
//               type="text"
//               placeholder="Residential Landmark"
//               value={formData.resiLandmark ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={2}>
//           <Form.Group controlId="resiPincode">
//             <Form.Label>Pincode</Form.Label>
//             <Form.Control
//               name="resiPincode"
//               type="text"
//               placeholder="Residential Pincode"
//               value={formData.resiPincode ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//       <Row className="mb-4">
//         <Col md={1} className="mt-2">
//           <Form.Check
//             type="radio"
//             label="Office"
//             name="preferredAddressType"
//             checked={formData.preferredAddressType === "office"}
//             onChange={() => handleAddressTypeChange("office")}
//           />
//         </Col>
//         <Col md={6}>
//           <Form.Group controlId="officeAddr">
//             <Form.Label>Address</Form.Label>
//             <Form.Control
//               name="officeAddr"
//               type="text"
//               placeholder="Office Address"
//               value={formData.officeAddr ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="officeLandmark">
//             <Form.Label>Landmark</Form.Label>
//             <Form.Control
//               name="officeLandmark"
//               type="text"
//               placeholder="Office Landmark"
//               value={formData.officeLandmark ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={2}>
//           <Form.Group controlId="officePincode">
//             <Form.Label>Pincode</Form.Label>
//             <Form.Control
//               name="officePincode"
//               type="text"
//               placeholder="Office Pincode"
//               value={formData.officePincode ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//       <Row className="mb-4">
//         <Col md={5}>
//           <Form.Group controlId="preferredMeetingAddr">
//             <Form.Label>Preferred Meeting Address</Form.Label>
//             <Form.Control
//               name="preferredMeetingAddr"
//               type="text"
//               placeholder="Preferred Meeting Address"
//               value={formData.preferredMeetingAddr ?? ""}
//               onChange={handleChange}
//               size="sm"
//               readOnly
//             />
//           </Form.Group>
//         </Col>
//         <Col md={2}>
//           <Form.Group controlId="preferredMeetingArea">
//             <Form.Label>Preferred Meeting Area</Form.Label>
//             <Form.Control
//               name="preferredMeetingArea"
//               type="text"
//               placeholder="Preferred Meeting Area"
//               value={formData.preferredMeetingArea ?? ""}
//               onChange={handleChange}
//               size="sm"
//               readOnly
//             />
//           </Form.Group>
//         </Col>
//         <Col md={2}>
//           <Form.Group controlId="city">
//             <Form.Label>City</Form.Label>
//             <Form.Control
//               name="city"
//               type="text"
//               placeholder="City"
//               value={formData.city ?? ""}
//               onChange={handleChange}
//               size="sm"
//               readOnly
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="bestTime">
//             <Form.Label>Best Time</Form.Label>
//             <Form.Select
//               name="bestTime"
//               value={formData.bestTime ?? ""}
//               onChange={handleChange}
//               size="sm"
//             >
//               <option value="">-- Select Time --</option>
//               <option value="10 AM to 2 PM">10 AM to 2 PM</option>
//               <option value="2 PM to 7 PM">2 PM to 7 PM</option>
//             </Form.Select>
//           </Form.Group>
//         </Col>
//       </Row>
//       <Row className="mb-4">
//         <Col md={3}>
//           <Form.Group controlId="hobbies">
//             <Form.Label>Hobbies</Form.Label>
//             <Form.Control
//               name="hobbies"
//               type="text"
//               placeholder="Hobbies"
//               value={formData.hobbies ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="nativePlace">
//             <Form.Label>Native Place</Form.Label>
//             <Form.Control
//               name="nativePlace"
//               type="text"
//               placeholder="Native Place"
//               value={formData.nativePlace ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="socialLink">
//             <Form.Label>Social Link</Form.Label>
//             <Form.Control
//               name="socialLink"
//               type="text"
//               placeholder="Social Link"
//               value={formData.socialLink ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="habits">
//             <Form.Label>Habits</Form.Label>
//             <Form.Control
//               name="habits"
//               type="text"
//               placeholder="Habits"
//               value={formData.habits ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//       <Row className="mb-4">
//         <Col md={3}>
//                   <Form.Group controlId="leadSource">
//                     <Form.Label>Lead Source</Form.Label>
//                     <Form.Select
//                       name="leadSource"
//                       value={formData.leadSource ?? ""}
//                       onChange={handleChange}
//                       size="sm"
//                     >
//                       <option value="">Select Lead Source</option>
//                       <option value="Referred">Referred</option>
//                       <option value="Digital Platform">Digital Platform</option>
//                       <option value="Employee">Employee</option>
//                       <option value="Business Associate">Business Associate</option>
//                       <option value="Internship">Internship</option>
//                       <option value="Direct">Direct</option>
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group controlId="leadName">
//                     <Form.Label>Lead Name</Form.Label>
//                     <Form.Control
//                       name="leadName"
//                       type="text"
//                       placeholder="Lead Name"
//                       value={formData.leadName ?? ""}
//                       onChange={handleChange}
//                       size="sm"
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group controlId="leadOccupation">
//                     <Form.Label>Lead Occupation</Form.Label>
//                     <Form.Select
//                       name="leadOccupation"
//                       value={formData.leadOccupation ?? ""}
//                       onChange={handleChange}
//                       size="sm"
//                     >
//                       <option value="">Select Lead Occupation</option>
//                       <option value="Businessman">Businessman</option>
//                       <option value="Govt.Service">Govt.Service</option>
//                       <option value="Private Service">Private Service</option>
//                       <option value="Retired">Retired</option>
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group controlId="leadOccupationType">
//                     <Form.Label>Lead Occupation Type</Form.Label>
//                     <Form.Select
//                       name="leadOccupationType"
//                       value={formData.leadOccupationType ?? ""}
//                       onChange={handleChange}
//                       size="sm"
//                     >
//                       <option value="">Select Lead Occupation Type</option>
//                       <option value="CA">CA</option>
//                       <option value="Jwellars">Jwellars</option>
//                       <option value="Iron Merchant">Iron Merchant</option>
//                       <option value="Kirana Merchant">Kirana Merchant</option>
//                       <option value="Sugar Tredars">Sugar Tredars</option>
//                       <option value="Cloth Merchant">Cloth Merchant</option>
//                       <option value="Whole Sale Stationary">Whole Sale Stationary</option>
//                       <option value="Tent & Lighte">Tent & Lighte</option>
//                       <option value="Pan Masala Merchant">Pan Masala Merchant</option>
//                       <option value="Bartan Merchant">Bartan Merchant</option>
//                       <option value="Paper Traders">Paper Traders</option>
//                       <option value="Restorent Ownar">Restorent Ownar</option>
//                       <option value="Hotel Ownar">Hotel Ownar</option>
//                       <option value="Electronics Shop Owner">Electronics Shop Owner</option>
//                       <option value="Electricals Shop Owner">Electricals Shop Owner</option>
//                       <option value="Tyre Dealers">Tyre Dealers</option>
//                       <option value="Tea Merchents">Tea Merchents</option>
//                       <option value="Whole Sale Medical Shop">Whole Sale Medical Shop</option>
//                       <option value="Automobile Dealears">Automobile Dealears</option>
//                       <option value="Cycle Dealers">Cycle Dealers</option>
//                       <option value="Transportars">Transportars</option>
//                       <option value="Retail Cloth Merchant">Retail Cloth Merchant</option>
//                       <option value="Bangle Merchant">Bangle Merchant</option>
//                       <option value="Book Salears">Book Salears</option>
//                       <option value="Grain & Oil Seads Merchant">Grain & Oil Seads Merchant</option>
//                       <option value="Oil & Ghee Merchant">Oil & Ghee Merchant</option>
//                       <option value="Doctors">Doctors</option>
//                       <option value="PVT.Service">PVT.Service</option>
//                       <option value="Retired">Retired</option>
//                       <option value="Industrialist">Industrialist</option>
//                       <option value="Teacher">Teacher</option>
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//       </Row>
//       <Row className="mb-4">
//         <Col md={4}>
//           <Form.Group controlId="callingPurpose">
//             <Form.Label>Calling Purpose</Form.Label>
//             <Form.Select
//               name="callingPurpose"
//               value={formData.callingPurpose ?? ""}
//               onChange={handleChange}
//               size="sm"
//             >
//               <option value="">-- Select Purpose --</option>
//               <option value="Follow-up">Follow-up</option>
//               <option value="Meeting Schedule">Meeting Schedule</option>
//               <option value="Query Resolution">Query Resolution</option>
//               <option value="Proposal Discussion">Proposal Discussion</option>
//               <option value="Other">Other</option>
//             </Form.Select>
//           </Form.Group>
//         </Col>
//         <Col md={4}>
//           <Form.Group controlId="allocatedCRE">
//             <Form.Label>Allocated CRE</Form.Label>
//             <Form.Control
//               name="allocatedCRE"
//               type="text"
//               placeholder="Allocated CRE"
//               value={formData.allocatedCRE ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group controlId="name">
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               name="name"
//               type="text"
//               placeholder="Name"
//               value={formData.name ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//       <Row className="mb-4">
//         <Col md={9}>
//           <Form.Group controlId="remark">
//             <Form.Label>Remark</Form.Label>
//             <Form.Control
//               name="remark"
//               as="textarea"
//               rows={2}
//               placeholder="Remark"
//               value={formData.remark ?? ""}
//               onChange={handleChange}
//               size="sm"
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//       <Button type="submit" className="btn btn-primary">
//         {isEdit && prospectData?._id ? "Update" : "Create"}
//       </Button>
//     </Form>
//   );
// };

// export default PersonalDetailsFormForProspect;





import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import { createClient, updateClientPersonalDetails } from "../../../redux/feature/ClientRedux/ClientThunx";
 import { fetchDetails } from "../../../redux/feature/LeadSource/LeadThunx";
import { getAllOccupations } from "../../../redux/feature/LeadOccupation/OccupationThunx";
import { getAllOccupationTypes } from "../../../redux/feature/OccupationType/OccupationThunx";
import { toast } from "react-toastify";
import axiosInstance from "/src/config/axios";
import { fetchLeadType } from "../../../redux/feature/LeadType/LeadTypeThunx";
// import { fetchDetailss } from "../../../redux/feature/LeadSource/LeadThunx"

const incomeOptions = [
  { value: "25 lakh to 1 Cr.", label: "25 lakh to 1 Cr." },
  { value: "5 to 25 lakh", label: "5 to 25 lakh" },
  { value: "2.5 to 5 lakh", label: "2.5 to 5 lakh" },
];

const gradeMap = {
  "25 lakh to 1 Cr.": 1,
  "5 to 25 lakh": 2,
  "2.5 to 5 lakh": 3,
};

const PersonalDetailsFormForProspect = ({ isEdit, clientData, onClientCreated,setFamilyDetail }) => {
  const dispatch = useDispatch();
  const initialFormState = {
    salutation: "",
    groupName: "",
    gender: "",
    organisation: "",
    designation: "",
    mobileNo: "",
    contactNo: "",
    whatsappNo: "",
    emailId: "",
    paName: "",
    paMobileNo: "",
    annualIncome: "",
    grade: "",
    preferredAddressType: "resi",
    resiAddr: "",
    resiLandmark: "",
    resiPincode: "",
    officeAddr: "",
    officeLandmark: "",
    officePincode: "",
    preferredMeetingAddr: "",
    preferredMeetingArea: "",
    city: "",
    bestTime: "",
    adharNumber: "",
    panCardNumber: "",
    hobbies: "",
    nativePlace: "",
    socialLink: "",
    habits: "",
    leadSource: "",
    leadName: "",
    leadOccupation: "",
    leadOccupationType: "",
    callingPurpose: "",
    name: "",
    allocatedCRE: "",
    remark: "",
  };
const [occupations, setOccupations] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  const { alldetails } = useSelector((state) => state.leadOccupation);
  const { alldetailsForTypes } = useSelector((state) => state.OccupationType);
  const [occupationTypes, setOccupationTypes] = useState([])
const [whatsappEdited, setWhatsappEdited] = useState(false);
const [contactEdited, setcontactEdited] = useState(false);

  const { LeadType: leadTypes, loading } = useSelector((state) => state.LeadType);
     const { leadsourceDetail } = useSelector((state) => state.leadsource);

  // Component mount hote hi data fetch
  useEffect(() => {
    dispatch(fetchLeadType());
  }, [dispatch]);

    useEffect(() => {
    dispatch(fetchDetails());
  }, [dispatch]);

const handleMobileWhatsappChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    let updated = { ...prev, [name]: value };

    // ✅ agar mobileNo complete ho (10 digit for example) aur whatsapp edit nahi hua ho
    if (name === "mobileNo" && value.length === 10 && !whatsappEdited  ) {
      updated.whatsappNo = value;
   
    }

    return updated;
  });

  if (name === "whatsappNo") {
    setWhatsappEdited(true);
  }

};



useEffect(() => {
    const fetchOccupations = async () => {
      try {
        const response = await axiosInstance.get("/api/occupation");
        if (response.data.success) {
          setOccupations(response.data.data); // API se aaya data store karo
        } else {
          console.error("Failed to fetch occupations:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching occupations:", error);
      }
    };
    fetchOccupations();
  }, []);



  useEffect(() => {
    const fetchOccupationTypes = async () => {
      try {
        const response = await axiosInstance.get("/api/occupation/types");
        if (response.data.success) {
          setOccupationTypes(response.data.data); // API se aaya data store karo
        } else {
          console.error("Failed to fetch occupation types:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching occupation types:", error);
      }
    };
    fetchOccupationTypes();
  }, []);

  useEffect(() => {
    dispatch(fetchDetails());
    dispatch(getAllOccupationTypes());
    dispatch(getAllOccupations());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && clientData) {
      setFormData(clientData.personalDetails);
    } else {
      setFormData(initialFormState);
    }
  }, [isEdit, clientData]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      grade: gradeMap[prev.annualIncome] || "",
    }));
  }, [formData.annualIncome]);

  const fetchAreaData = async (pincode) => {
    try {
      const response = await axiosInstance.get(`/api/leadarea?pincode=${pincode}`);
      const data = response.data;
      console.log("API Response:", data);

      if (data && Array.isArray(data)) {
        const area = data.find((item) => String(item.pincode) === String(pincode));
        return area || { name: "Area not found", city: "" };
      } else {
        return { name: "No data received", city: "" };
      }
    } catch (error) {
      console.error("Error fetching area data:", error);
      return { name: "Error fetching area", city: "" };
    }
  };

  useEffect(() => {
    const updatePreferredData = async () => {
      if (formData.preferredAddressType === "resi" && formData.resiPincode.length === 6) {
        const areaData = await fetchAreaData(formData.resiPincode);
        setFormData((prev) => ({
          ...prev,
          preferredMeetingAddr: prev.resiAddr,
          preferredMeetingArea: areaData.name,
          city: areaData.city,
        }));
      } else if (formData.preferredAddressType === "office" && formData.officePincode.length === 6) {
        const areaData = await fetchAreaData(formData.officePincode);
        setFormData((prev) => ({
          ...prev,
          preferredMeetingAddr: prev.officeAddr,
          preferredMeetingArea: areaData.name,
          city: areaData.city,
        }));
      }
    };
    updatePreferredData();
  }, [formData.preferredAddressType, formData.resiPincode, formData.officePincode, formData.resiAddr, formData.officeAddr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if ((name === "resiPincode" || name === "officePincode") && value.length === 6) {
      fetchAreaData(value).then((areaData) => {
        if (name === "resiPincode" && formData.preferredAddressType === "resi") {
          setFormData((prev) => ({
            ...prev,
            preferredMeetingArea: areaData.name,
            city: areaData.city,
          }));
        } else if (name === "officePincode" && formData.preferredAddressType === "office") {
          setFormData((prev) => ({
            ...prev,
            preferredMeetingArea: areaData.name,
            city: areaData.city,
          }));
        }
      });
    }
  };

  const handleAddressTypeChange = (type) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        preferredAddressType: type,
        preferredMeetingAddr: type === "resi" ? prev.resiAddr : prev.officeAddr,
      };
      if (type === "resi" && prev.resiPincode.length === 6) {
        fetchAreaData(prev.resiPincode).then((areaData) => {
          setFormData((prev) => ({
            ...prev,
            preferredMeetingArea: areaData.name,
            city: areaData.city,
          }));
        });
      } else if (type === "office" && prev.officePincode.length === 6) {
        fetchAreaData(prev.officePincode).then((areaData) => {
          setFormData((prev) => ({
            ...prev,
            preferredMeetingArea: areaData.name,
            city: areaData.city,
          }));
        });
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && clientData?._id) {
      console.log(formData);
      const result = await dispatch(updateClientPersonalDetails({ id: clientData._id, personalDetails: formData }));
      if (result) {
        setFormData(initialFormState);
        toast.info("Client details updated successfully");
        if (onClientCreated) onClientCreated(clientData._id);
      }
    } else {
      const resultAction = await dispatch(createClient({ personalDetails: formData }));
      if (resultAction) {
        toast.success("Client Created Successfully");
        setFamilyDetail(formData)
        setFormData(initialFormState);
        const clientId = resultAction?.payload;
        if (onClientCreated && clientId) onClientCreated(clientId);
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-4">
        <Col md={2}>
          <Form.Group controlId="salutation">
            <Form.Label>Salutation</Form.Label>
            <Form.Select
              name="salutation"
              value={formData.salutation ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select</option>
              <option>Mr.</option>
              <option>Mrs.</option>
              <option>Ms.</option>
              <option>Mast.</option>
              <option>Shri.</option>
              <option>Smt.</option>
              <option>Kum.</option>
              <option>Kr.</option>
              <option>Dr.</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group controlId="groupName">
            <Form.Label>Group Head</Form.Label>
            <Form.Control
              name="groupName"
              type="text"
              placeholder="Group Head"
              value={formData.groupName ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="gender">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group controlId="organisation">
            <Form.Label>Organisation</Form.Label>
            <Form.Control
              name="organisation"
              type="text"
              placeholder="Organisation"
              value={formData.organisation ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="designation">
            <Form.Label>Designation</Form.Label>
            <Form.Control
              name="designation"
              type="text"
              placeholder="Designation"
              value={formData.designation ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="annualIncome">
            <Form.Label style={{ color: "#00008B" }} className="fw-medium">
              Annual Income
            </Form.Label>
            <Form.Select
              name="annualIncome"
              value={formData.annualIncome ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">-- Select --</option>
              {incomeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={1}>
          <Form.Group controlId="grade">
            <Form.Label style={{ color: "#00008B" }} className="fw-medium">
              Grade
            </Form.Label>
            <Form.Control
              type="text"
              name="grade"
              value={formData.grade ?? ""}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
        {/* <Col md={3}>
          <Form.Group controlId="mobileNo">
            <Form.Label>Mobile No</Form.Label>
            <Form.Control
              name="mobileNo"
              type="text"
              placeholder="Mobile No"
              value={formData.mobileNo ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="whatsappNo">
            <Form.Label>Whatsapp No</Form.Label>
            <Form.Control
              name="whatsappNo"
              type="text"
              placeholder="Whatsapp No"
              value={formData.whatsappNo ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col> */}
        <Col md={3}>
  <Form.Group controlId="mobileNo">
    <Form.Label>Mobile No</Form.Label>
    <Form.Control
      name="mobileNo"
      type="text"
      placeholder="Mobile No"
      value={formData.mobileNo ?? ""}
      onChange={handleMobileWhatsappChange}
      maxLength={10}
      size="sm"
    />
  </Form.Group>
</Col>

<Col md={3}>
  <Form.Group controlId="whatsappNo">
    <Form.Label>WhatsApp No</Form.Label>
    <Form.Control
      name="whatsappNo"
      type="text"
      placeholder="WhatsApp No"
      value={formData.whatsappNo ?? ""}
      maxLength={10}
      onChange={handleMobileWhatsappChange}
      size="sm"
    />
  </Form.Group>
</Col>

     <Col md={3}>
  <Form.Group controlId="contactNo">
    <Form.Label>Phone No</Form.Label>
    <Form.Control
      name="contactNo"
      type="text"
      placeholder="Phone No"
      maxLength={14}
      value={`0755${formData.contactNo ?? ""}`}  // 👈 prefix + stored number
      onChange={(e) =>
        setFormData({
          ...formData,
          contactNo: e.target.value.replace(/^0755/, ""), // 👈 store without prefix
        })
      }
      size="sm"
    />
  </Form.Group>
</Col>

        <Col md={3}>
          <Form.Group controlId="emailId">
            <Form.Label>Email Id</Form.Label>
            <Form.Control
              name="emailId"
              type="email"
              placeholder="Email Id"
              value={formData.emailId ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group controlId="paName">
            <Form.Label>PA Name</Form.Label>
            <Form.Control
              name="paName"
              type="text"
              placeholder="PA Name"
              value={formData.paName ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="paMobileNo">
            <Form.Label>PA Mobile No</Form.Label>
            <Form.Control
              name="paMobileNo"
              type="tel"
              maxLength={10}
              placeholder="PA Mobile No"
              value={formData.paMobileNo ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="adharNumber">
            <Form.Label>Aadhar No</Form.Label>
            <Form.Control
              name="adharNumber"
              type="text"
              placeholder="Aadhar Number"
              maxLength={12}
              value={formData.adharNumber ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="panCardNumber">
            <Form.Label>PAN  No.</Form.Label>
            <Form.Control
              name="panCardNumber"
              type="text"
              placeholder="PAN  Number"
              value={formData.panCardNumber ?? ""}
              onChange={handleChange}
               maxLength={10}
              size="sm"
              style={{ textTransform: "uppercase" }}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={1} className="mt-2">
          <Form.Check
            type="radio"
            label="Resi."
            name="preferredAddressType"
            checked={formData.preferredAddressType === "resi"}
            onChange={() => handleAddressTypeChange("resi")}
          />
        </Col>
        <Col md={6}>
          <Form.Group controlId="resiAddr">
            <Form.Label>Address</Form.Label>
            <Form.Control
              name="resiAddr"
              type="text"
              placeholder="Residential Address"
              value={formData.resiAddr ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="resiLandmark">
            <Form.Label>Landmark</Form.Label>
            <Form.Control
              name="resiLandmark"
              type="text"
              placeholder="Residential Landmark"
              value={formData.resiLandmark ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="resiPincode">
            <Form.Label>Pincode</Form.Label>
            <Form.Control
              name="resiPincode"
              type="text"
              placeholder="Residential Pincode"
              value={formData.resiPincode ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={1} className="mt-2">
          <Form.Check
            type="radio"
            label="Office"
            name="preferredAddressType"
            checked={formData.preferredAddressType === "office"}
            onChange={() => handleAddressTypeChange("office")}
          />
        </Col>
        <Col md={6}>
          <Form.Group controlId="officeAddr">
            <Form.Label>Address</Form.Label>
            <Form.Control
              name="officeAddr"
              type="text"
              placeholder="Office Address"
              value={formData.officeAddr ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="officeLandmark">
            <Form.Label>Landmark</Form.Label>
            <Form.Control
              name="officeLandmark"
              type="text"
              placeholder="Office Landmark"
              value={formData.officeLandmark ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="officePincode">
            <Form.Label>Pincode</Form.Label>
            <Form.Control
              name="officePincode"
              type="text"
              placeholder="Office Pincode"
              value={formData.officePincode ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={5}>
          <Form.Group controlId="preferredMeetingAddr">
            <Form.Label>Preferred Meeting Address</Form.Label>
            <Form.Control
              name="preferredMeetingAddr"
              type="text"
              placeholder="Preferred Meeting Address"
              value={formData.preferredMeetingAddr ?? ""}
              onChange={handleChange}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="preferredMeetingArea">
            <Form.Label>Preferred Meeting Area</Form.Label>
            <Form.Control
              name="preferredMeetingArea"
              type="text"
              placeholder="Preferred Meeting Area"
              value={formData.preferredMeetingArea ?? ""}
              onChange={handleChange}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="city">
            <Form.Label>City</Form.Label>
            <Form.Control
              name="city"
              type="text"
              placeholder="City"
              value={formData.city ?? ""}
              onChange={handleChange}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="bestTime">
            <Form.Label>Best Time</Form.Label>
            <Form.Select
              name="bestTime"
              value={formData.bestTime ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">-- Select Time --</option>
              <option value="10 AM to 2 PM">10 AM to 2 PM</option>
              <option value="2 PM to 7 PM">2 PM to 7 PM</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group controlId="hobbies">
            <Form.Label>Hobbies</Form.Label>
            <Form.Control
              name="hobbies"
              type="text"
              placeholder="Hobbies"
              value={formData.hobbies ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="nativePlace">
            <Form.Label>Native Place</Form.Label>
            <Form.Control
              name="nativePlace"
              type="text"
              placeholder="Native Place"
              value={formData.nativePlace ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="socialLink">
            <Form.Label>Social Link</Form.Label>
            <Form.Control
              name="socialLink"
              type="text"
              placeholder="Social Link"
              value={formData.socialLink ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="habits">
            <Form.Label>Habits</Form.Label>
            <Form.Control
              name="habits"
              type="text"
              placeholder="Habits"
              value={formData.habits ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
     <Col md={3}>
      <Form.Group controlId="leadSource">
        <Form.Label>Lead Source</Form.Label>
        <Form.Select
          name="leadSource"
          value={formData.leadSource ?? ""}
          onChange={handleChange}
          size="sm"
        >
          <option value="">Select Lead Source</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : (
            leadTypes?.map((type) => (
              <option key={type._id} value={type.leadType.trim()}>
                {type.leadType.trim()}
              </option>
            ))
          )}
        </Form.Select>
      </Form.Group>
    </Col>
      <Col md={3}>
      <Form.Group controlId="leadName">
        <Form.Label>Lead Name</Form.Label>
        <Form.Select
          name="leadName"
          value={formData.leadName ?? ""}
          onChange={handleChange}
          size="sm"
        >
          <option value="">Select Lead Name</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : (
            leadsourceDetail?.map((src) => (
              <option key={src._id} value={src.sourceName}>
                {src.sourceName}
              </option>
            ))
          )}
        </Form.Select>
      </Form.Group>
    </Col>
        {/* <Col md={3}>
          <Form.Group controlId="leadOccupation">
            <Form.Label>Lead Occupation</Form.Label>
            <Form.Select
              name="leadOccupation"
              value={formData.leadOccupation ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select Lead Occupation</option>
              <option value="Businessman">Businessman</option>
              <option value="Govt.Service">Govt.Service</option>
              <option value="Private Service">Private Service</option>
              <option value="Retired">Retired</option>
            </Form.Select>
          </Form.Group>
        </Col> */}
        <Col md={3}>
          <Form.Group controlId="leadOccupation">
            <Form.Label>Lead Occupation</Form.Label>
            <Form.Select
              name="leadOccupation"
              value={formData.leadOccupation ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select Lead Occupation</option>
              {occupations.map((occupation) => (
                <option key={occupation._id} value={occupation.occupationName}>
                  {occupation.occupationName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        {/* <Col md={3}>
          <Form.Group controlId="leadOccupationType">
            <Form.Label>Lead Occupation Type</Form.Label>
            <Form.Select
              name="leadOccupationType"
              value={formData.leadOccupationType ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select Lead Occupation Type</option>
              <option value="CA">CA</option>
              <option value="Jwellars">Jwellars</option>
              <option value="Iron Merchant">Iron Merchant</option>
              <option value="Kirana Merchant">Kirana Merchant</option>
              <option value="Sugar Tredars">Sugar Tredars</option>
              <option value="Cloth Merchant">Cloth Merchant</option>
              <option value="Whole Sale Stationary">Whole Sale Stationary</option>
              <option value="Tent & Lighte">Tent & Lighte</option>
              <option value="Pan Masala Merchant">Pan Masala Merchant</option>
              <option value="Bartan Merchant">Bartan Merchant</option>
              <option value="Paper Traders">Paper Traders</option>
              <option value="Restorent Ownar">Restorent Ownar</option>
              <option value="Hotel Ownar">Hotel Ownar</option>
              <option value="Electronics Shop Owner">Electronics Shop Owner</option>
              <option value="Electricals Shop Owner">Electricals Shop Owner</option>
              <option value="Tyre Dealers">Tyre Dealers</option>
              <option value="Tea Merchents">Tea Merchents</option>
              <option value="Whole Sale Medical Shop">Whole Sale Medical Shop</option>
              <option value="Automobile Dealears">Automobile Dealears</option>
              <option value="Cycle Dealers">Cycle Dealers</option>
              <option value="Transportars">Transportars</option>
              <option value="Retail Cloth Merchant">Retail Cloth Merchant</option>
              <option value="Bangle Merchant">Bangle Merchant</option>
              <option value="Book Salears">Book Salears</option>
              <option value="Grain & Oil Seads Merchant">Grain & Oil Seads Merchant</option>
              <option value="Oil & Ghee Merchant">Oil & Ghee Merchant</option>
              <option value="Doctors">Doctors</option>
              <option value="PVT.Service">PVT.Service</option>
              <option value="Retired">Retired</option>
              <option value="Industrialist">Industrialist</option>
              <option value="Teacher">Teacher</option>
            </Form.Select>
          </Form.Group>
        </Col> */}


        <Col md={3}>
          <Form.Group controlId="leadOccupationType">
            <Form.Label>Lead Occupation Type</Form.Label>
            <Form.Select
              name="leadOccupationType"
              value={formData.leadOccupationType ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select Lead Occupation Type</option>
              {occupationTypes.map((type) => (
                <option key={type._id} value={type.occupationType}>
                  {type.occupationType}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

      </Row>
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group controlId="callingPurpose">
            <Form.Label>Calling or Meeting Purpose</Form.Label>
            <Form.Select
              name="callingPurpose"
              value={formData.callingPurpose ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">-- Select Purpose --</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Meeting Schedule">Meeting Schedule</option>
              <option value="Query Resolution">Query Resolution</option>
              <option value="Proposal Discussion">Proposal Discussion</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>
        </Col>
                <Col md={3}>
          <Form.Group controlId="name">
            <Form.Label>Purpose name / Task name</Form.Label>
            <Form.Control
              name="name"
              type="text"
              placeholder="Name"
              value={formData.name ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="allocatedCRE">
            <Form.Label>Allocated CRE</Form.Label>
            <Form.Control
              name="allocatedCRE"
              type="text"
              placeholder="Allocated CRE"
              value={formData.allocatedCRE ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>

      </Row>
      <Row className="mb-4">
        <Col md={9}>
          <Form.Group controlId="remark">
            <Form.Label>Remark</Form.Label>
            <Form.Control
              name="remark"
              as="textarea"
              rows={2}
              placeholder="Remark"
              value={formData.remark ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>
      <Button type="submit" className="btn btn-primary">
        {isEdit && clientData?._id ? "Update" : "Create"}
      </Button>
    </Form>
  );
};
export default PersonalDetailsFormForProspect;