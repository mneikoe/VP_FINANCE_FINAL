import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  createSuspectLead,
  fetchSuspectLeadById,
  updateSuspectLead,
} from "../../redux/feature/SuspectLead/SuspectLeadThunx";
import { fetchLeadOccupationDetails } from "../../redux/feature/LeadOccupation/OccupationThunx";
import { fetchDetails } from "../../redux/feature/LeadSource/LeadThunx";
const initialFormState = {
  salutation: "",
  familyHead: "",
  gender: "",
  organisation: "",
  designation: "",
  annualIncome: "",
  grade: "",
  mobile: "",
  contactNo: "",
  whatsapp: "",
  email: "",
  dob: "",
  dom: "",
  preferredAddressType: "",
  resiAddr: "",
  resiLandmark: "",
  resiPincode: "",
  officeAddr: "",
  officeLandmark: "",
  officePincode: "",
  preferredMeetingAddr: "",
  preferredMeetingArea: "",
  city: "",
  leadSource: "",
  leadName: "",
  leadOccupation: "",
  occupationType: "",
  callingPurpose: "",
  name: "",
};

const AddSuspect = ({ editId, setActiveTab, setEditId }) => {
  const dispatch = useDispatch();

  const { loading, error, currentLead } = useSelector(
    (state) => state.suspectLead
  );
  const [form, setForm] = useState(initialFormState);

  // --------------------------lead cource and lead occupation -----------------------------
  const leadOccupations = useSelector((state) => state.leadOccupation.details);

  const leadSources = useSelector((state) => state.leadsource.leadsourceDetail);

  useEffect(() => {
    const init = async () => {
      try {
        await dispatch(fetchLeadOccupationDetails()).unwrap();
        await dispatch(fetchDetails()).unwrap();
      } catch (error) {
        console.log(error);
      }
    };

    init();
  }, []);

  // console.log(leadSource);

  // --------------------------
  useEffect(() => {
    if (editId) {
      dispatch(fetchSuspectLeadById(editId));
    } else {
      setForm(initialFormState);
    }
  }, [editId, dispatch]);

  useEffect(() => {
    if (editId && currentLead && currentLead._id === editId) {
      console.log("✅ currentLead loaded:", currentLead);
      setForm({
        ...initialFormState,
        ...currentLead.personalDetails,
      });
    }
  }, [editId, currentLead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === "annualIncome") {
      let grade = "";
      if (value === "25 lakh to 1 Cr.") grade = 1;
      else if (value === "5 to 25 lakh") grade = 2;
      else if (value === "2.5 to 5 lakh") grade = 3;
      updatedForm.grade = grade;
    }

    setForm(updatedForm);
  };

  const handleRadioChange = (e) => {
    const value = e.target.value;
    const address =
      value === "resi"
        ? form.resiAddr
        : value === "office"
        ? form.officeAddr
        : "";
    const pincode =
      value === "resi"
        ? form.resiPincode
        : value === "office"
        ? form.officePincode
        : "";

    setForm((prev) => ({
      ...prev,
      preferredAddressType: value,
      preferredMeetingAddr: address,
      preferredMeetingArea: pincode ? `Area for ${pincode}` : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedForm = { ...form };
    if (form.preferredAddressType === "resi") {
      cleanedForm.officeAddr = "";
      cleanedForm.officeLandmark = "";
      cleanedForm.officePincode = "";
    } else if (form.preferredAddressType === "office") {
      cleanedForm.resiAddr = "";
      cleanedForm.resiLandmark = "";
      cleanedForm.resiPincode = "";
    }

    try {
      const leadDataToSave = {
        personalDetails: {
          name: form.name,
          salutation: form.salutation,
          familyHead: form.familyHead,
          gender: form.gender,
          organisation: form.organisation,
          designation: form.designation,
          annualIncome: form.annualIncome,
          grade: form.grade,
          mobile: form.mobile,
          contactNo: form.contactNo,
          whatsapp: form.whatsapp,
          email: form.email,
          dob: form.dob,
          dom: form.dom,
          preferredAddressType: form.preferredAddressType,
          resiAddr: form.resiAddr,
          resiLandmark: form.resiLandmark,
          resiPincode: form.resiPincode,
          officeAddr: form.officeAddr,
          officeLandmark: form.officeLandmark,
          officePincode: form.officePincode,
          preferredMeetingAddr: form.preferredMeetingAddr,
          preferredMeetingArea: form.preferredMeetingArea,
          city: form.city,

          leadSource: form.leadSource,
          leadName: form.leadName,
          leadOccupation: form.leadOccupation,
          occupationType: form.occupationType,
          callingPurpose: form.callingPurpose,
        },
      };

      let resultAction;
      if (editId) {
        resultAction = await dispatch(
          // updateSuspectLead({ id: editId, leadData: cleanedForm })
          updateSuspectLead({ id: editId, leadData: leadDataToSave })
        );
      } else {
        // resultAction = await dispatch(createSuspectLead(cleanedForm));
        resultAction = await dispatch(createSuspectLead(leadDataToSave));
      }
      console.log(cleanedForm, "form data");

      if (resultAction.payload) {
        alert(`Lead successfully ${editId ? "updated" : "added"}!`);
        setForm(initialFormState); // clear form fields
        setEditId(null); // clear editId
        setActiveTab("display");
        if (!editId) {
          setForm(initialFormState);
        } else {
          setActiveTab("display");
          setEditId(null);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (editId && loading) {
    return (
      <Container className="text-center mt-4">
        <Spinner animation="border" /> Loading lead data...
      </Container>
    );
  }

  return (
    <Container className="mt-4 p-3 border rounded bg-light">
      <h4 className="mb-4">
        {editId ? "Edit Suspect Lead" : "Add Suspect Lead"}
      </h4>
      {error && <div className="text-danger mb-3">Error: {error}</div>}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Salutation</Form.Label>
            <Form.Select
              name="salutation"
              value={form.salutation}
              onChange={handleChange}
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
          </Col>
          <Col md={4}>
            <Form.Label>Family Head</Form.Label>
            <Form.Control
              name="familyHead"
              value={form.familyHead}
              onChange={handleChange}
            />
          </Col>
          <Col md={4}>
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Label>Organisation</Form.Label>
            <Form.Control
              name="organisation"
              value={form.organisation}
              onChange={handleChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Designation</Form.Label>
            <Form.Control
              name="designation"
              value={form.designation}
              onChange={handleChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Annual Income</Form.Label>
            <Form.Select
              name="annualIncome"
              value={form.annualIncome}
              onChange={handleChange}
            >
              <option value="">Choose</option>
              <option>25 lakh to 1 Cr.</option>
              <option>5 to 25 lakh</option>
              <option>2.5 to 5 lakh</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Grade</Form.Label>
            <Form.Control name="grade" value={form.grade} readOnly />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Mobile No.</Form.Label>
            <Form.Control
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
            />
          </Col>
          <Col md={4}>
            <Form.Label>Contact No.</Form.Label>
            <Form.Control
              name="contactNo"
              value={form.contactNo}
              onChange={handleChange}
            />
          </Col>
          <Col md={4}>
            <Form.Label>Whatsapp</Form.Label>
            <Form.Control
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </Col>
          <Col md={4}>
            <Form.Label>DOB</Form.Label>
            <Form.Control
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
            />
          </Col>
          <Col md={4}>
            <Form.Label>DOM</Form.Label>
            <Form.Control
              name="dom"
              type="date"
              value={form.dom}
              onChange={handleChange}
            />
          </Col>
        </Row>

        {/* Resi & Office Address */}
        <Row className="mb-3">
          <Col md={2} className="pt-4">
            {/* <Form.Check
              type="radio"
              value="resi"
              checked={sourceRadio === "resi"}
              onChange={handleRadioChange}
              label="Select"
            /> */}
            <Form.Check
              type="radio"
              value="resi"
              name="preferredAddressType"
              checked={form.preferredAddressType === "resi"}
              onChange={handleRadioChange}
              label="Select"
            />
          </Col>
          <Col md={3}>
            <Form.Label>Resi. Address</Form.Label>
            <Form.Control
              name="resiAddr"
              value={form.resiAddr}
              onChange={handleChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Landmark</Form.Label>
            <Form.Control
              name="resiLandmark"
              value={form.resiLandmark}
              onChange={handleChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Pin Code</Form.Label>
            <Form.Control
              name="resiPincode"
              value={form.resiPincode}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={2} className="pt-4">
            <Form.Check
              type="radio"
              value="office"
              name="preferredAddressType"
              checked={form.preferredAddressType === "office"}
              onChange={handleRadioChange}
              label="Select"
            />
          </Col>
          <Col md={3}>
            <Form.Label>Off. Address</Form.Label>
            <Form.Control
              name="officeAddr"
              value={form.officeAddr}
              onChange={handleChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Landmark</Form.Label>
            <Form.Control
              name="officeLandmark"
              value={form.officeLandmark}
              onChange={handleChange}
            />
          </Col>
          <Col md={2}>
            <Form.Label>Pincode</Form.Label>
            <Form.Control
              name="officePincode"
              value={form.officePincode}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="text-primary fw-bold">
              Preferred Meeting Address
            </Form.Label>
            <Form.Control
              name="preferredMeetingAddr"
              value={form.preferredMeetingAddr}
              onChange={handleChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="text-primary fw-bold">Area</Form.Label>
            <Form.Control
              name="preferredMeetingArea"
              value={form.preferredMeetingArea}
              onChange={handleChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>City</Form.Label>
            <Form.Control
              name="city"
              value={form.city}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          {/* Lead Source */}
          <Col md={3}>
            <Form.Label>Lead Source</Form.Label>
            <Form.Select
              name="leadSource"
              value={form.leadSource}
              onChange={handleChange}
            >
              <option value="">Select Lead Source</option>
              {leadSources.map((source) => (
                <option key={source._id} value={source.leadName}>
                  {source.leadName}
                </option>
              ))}
            </Form.Select>
          </Col>

          {/* Lead Name */}
          <Col md={3}>
            <Form.Label htmlFor="leadName">Lead Name</Form.Label>
            <Form.Control
              id="leadName"
              name="leadName"
              value={form.leadName}
              onChange={handleChange}
              placeholder="Enter lead name"
            />
          </Col>

          {/* Lead Occupation */}
          <Col md={3}>
            <Form.Label htmlFor="leadOccupation">Lead Occupation</Form.Label>
            <Form.Select
              id="leadOccupation"
              name="leadOccupation"
              value={form.leadOccupation}
              onChange={handleChange}
            >
              <option value="">Select Lead Occupation</option>
              {leadOccupations.map(
                (occupation) => (
                  console.log(occupation, "occupation"),
                  (
                    <option key={occupation._id} value={occupation.leadName}>
                      {occupation.leadName}
                    </option>
                  )
                )
              )}
            </Form.Select>
          </Col>

          {/* Occupation Type */}
          <Col md={3}>
            <Form.Label htmlFor="occupationType">Occupation Type</Form.Label>
            <Form.Control
              id="occupationType"
              name="occupationType"
              value={form.occupationType}
              onChange={handleChange}
              placeholder="Enter occupation type"
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Calling Purpose</Form.Label>
            <Form.Select
              name="callingPurpose"
              value={form.callingPurpose}
              onChange={handleChange}
            >
              <option value="Servicing">Servicing</option>
              <option value="Sales">Marketing</option>
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label>Name</Form.Label>
            <Form.Select name="name" value={form.name} onChange={handleChange}>
              <option value="LIC">LIC</option>
              <option value="Portfolio Management">Portfolio Management</option>
            </Form.Select>
          </Col>
        </Row>

        <div className="d-flex justify-content-between">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" />{" "}
                {editId ? "Updating..." : "Submitting..."}
              </>
            ) : editId ? (
              "Update Lead"
            ) : (
              "Submit Lead"
            )}
          </Button>

          {editId && (
            <Button
              variant="secondary"
              onClick={() => {
                setActiveTab("display");
                setEditId(null);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </Form>
    </Container>
  );
};

export default AddSuspect;
