import React, { useState } from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import {
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaFileAlt,
  FaCheckCircle,
} from "react-icons/fa";
import axios from "axios";

const InternshipForm = ({ show, onHide, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    gender: "Male",
    dateOfBirth: "",
    nationality: "Indian",
    contactNo: "",
    email: "",
    permanentAddress: "",

    // Educational Background
    universityName: "",
    degreeProgram: "",
    yearOfStudy: "First Year",
    expectedGraduationDate: "",
    cumulativeGPA: "",

    // Internship Details
    positionApplied: "",
    preferredStartDate: "",
    preferredEndDate: "",
    hoursPerWeek: "",

    // Skills
    relevantSkills: "",

    // Declaration
    declarationAccepted: false,
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [otherFiles, setOtherFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [debugInfo, setDebugInfo] = useState("");

  const steps = [
    { id: 1, title: "Personal Info", icon: <FaUser />, color: "primary" },
    { id: 2, title: "Education", icon: <FaGraduationCap />, color: "info" },
    { id: 3, title: "Internship", icon: <FaBriefcase />, color: "warning" },
    { id: 4, title: "Skills & Docs", icon: <FaFileAlt />, color: "success" },
    { id: 5, title: "Declaration", icon: <FaCheckCircle />, color: "danger" },
  ];

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Debug log
    console.log(`Field changed: ${name} = ${value}`);
  };

  // Debug function to show current form data
  const showDebugInfo = () => {
    const info = `Current Step: ${currentStep}
FullName value: "${formData.fullName}"
FullName length: ${formData.fullName?.length}
FullName trimmed: "${formData.fullName?.trim()}"
Is fullName valid: ${formData.fullName?.trim() ? "YES" : "NO"}`;

    setDebugInfo(info);
    console.log(info);
  };

  // Validate current step
  const validateCurrentStep = () => {
    const newErrors = {};

    console.log(`Validating step ${currentStep}`);
    console.log("Form data:", formData);

    if (currentStep === 1) {
      console.log("Checking fullName:", formData.fullName);
      console.log("fullName trimmed:", formData.fullName?.trim());
      console.log("fullName empty?", !formData.fullName?.trim());

      if (!formData.fullName || !formData.fullName.trim()) {
        newErrors.fullName = "Full Name is required";
        console.log("fullName validation failed");
      }
      if (!formData.dateOfBirth)
        newErrors.dateOfBirth = "Date of Birth is required";
      if (!formData.contactNo || !formData.contactNo.trim())
        newErrors.contactNo = "Contact Number is required";
      if (!formData.email || !formData.email.trim())
        newErrors.email = "Email is required";

      if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (
        formData.contactNo &&
        !/^[0-9]{10}$/.test(formData.contactNo.replace(/\D/g, ""))
      ) {
        newErrors.contactNo = "Please enter a valid 10-digit contact number";
      }

      if (!formData.permanentAddress || !formData.permanentAddress.trim()) {
        newErrors.permanentAddress = "Address is required";
      }
    }

    if (currentStep === 2) {
      if (!formData.universityName || !formData.universityName.trim()) {
        newErrors.universityName = "University/College Name is required";
      }
      if (!formData.degreeProgram || !formData.degreeProgram.trim()) {
        newErrors.degreeProgram = "Degree/Program is required";
      }
      if (!formData.expectedGraduationDate) {
        newErrors.expectedGraduationDate =
          "Expected Graduation Date is required";
      }
      if (
        formData.cumulativeGPA &&
        (formData.cumulativeGPA < 0 || formData.cumulativeGPA > 10)
      ) {
        newErrors.cumulativeGPA = "GPA must be between 0 and 10";
      }
    }

    if (currentStep === 3) {
      if (!formData.positionApplied || !formData.positionApplied.trim()) {
        newErrors.positionApplied = "Position is required";
      }
      if (!formData.preferredStartDate)
        newErrors.preferredStartDate = "Start Date is required";
      if (!formData.preferredEndDate)
        newErrors.preferredEndDate = "End Date is required";
      if (!formData.hoursPerWeek)
        newErrors.hoursPerWeek = "Hours per week is required";

      if (formData.preferredStartDate && formData.preferredEndDate) {
        const startDate = new Date(formData.preferredStartDate);
        const endDate = new Date(formData.preferredEndDate);
        if (startDate >= endDate) {
          newErrors.preferredEndDate = "End date must be after start date";
        }
      }

      if (
        formData.hoursPerWeek &&
        (formData.hoursPerWeek < 10 || formData.hoursPerWeek > 40)
      ) {
        newErrors.hoursPerWeek = "Hours per week must be between 10 and 40";
      }
    }

    if (currentStep === 4) {
      if (!resumeFile) {
        newErrors.resume = "Resume is required";
      }
    }

    if (currentStep === 5) {
      if (!formData.declarationAccepted) {
        newErrors.declarationAccepted = "You must accept the declaration";
      }
    }

    console.log("Validation errors:", newErrors);
    return newErrors;
  };

  // Handle next step
  const handleNext = () => {
    console.log("Next button clicked, current step:", currentStep);
    showDebugInfo();

    const stepErrors = validateCurrentStep();

    if (Object.keys(stepErrors).length > 0) {
      console.log("Validation failed, errors:", stepErrors);
      setErrors(stepErrors);
      return;
    }

    console.log("Validation passed, moving to next step");

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
      setErrors({});
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
    }
  };

  // Handle file change
  const handleFileChange = (setter) => (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ resume: "File size should be less than 10MB" });
        return;
      }
      setter(file);
      if (errors.resume) {
        setErrors((prev) => ({ ...prev, resume: "" }));
      }
    }
  };

  // Handle multiple files
  const handleMultipleFiles = (e) => {
    if (e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > 20 * 1024 * 1024) {
        setErrors({
          otherDocuments: "Total file size should be less than 20MB",
        });
        return;
      }
      setOtherFiles(files);
      if (errors.otherDocuments) {
        setErrors((prev) => ({ ...prev, otherDocuments: "" }));
      }
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submit form clicked");
    showDebugInfo();

    // Validate all steps before submit
    let allErrors = {};
    for (let i = 1; i <= steps.length; i++) {
      const tempStep = i;
      const tempErrors = {};

      if (tempStep === 1) {
        if (!formData.fullName || !formData.fullName.trim()) {
          tempErrors.fullName = "Full Name is required";
        }
        if (!formData.dateOfBirth)
          tempErrors.dateOfBirth = "Date of Birth is required";
        if (!formData.contactNo || !formData.contactNo.trim())
          tempErrors.contactNo = "Contact Number is required";
        if (!formData.email || !formData.email.trim())
          tempErrors.email = "Email is required";
        if (!formData.permanentAddress || !formData.permanentAddress.trim()) {
          tempErrors.permanentAddress = "Address is required";
        }
      }

      if (tempStep === 2) {
        if (!formData.universityName || !formData.universityName.trim()) {
          tempErrors.universityName = "University/College Name is required";
        }
        if (!formData.degreeProgram || !formData.degreeProgram.trim()) {
          tempErrors.degreeProgram = "Degree/Program is required";
        }
        if (!formData.expectedGraduationDate) {
          tempErrors.expectedGraduationDate =
            "Expected Graduation Date is required";
        }
      }

      if (tempStep === 3) {
        if (!formData.positionApplied || !formData.positionApplied.trim()) {
          tempErrors.positionApplied = "Position is required";
        }
        if (!formData.preferredStartDate)
          tempErrors.preferredStartDate = "Start Date is required";
        if (!formData.preferredEndDate)
          tempErrors.preferredEndDate = "End Date is required";
        if (!formData.hoursPerWeek)
          tempErrors.hoursPerWeek = "Hours per week is required";
      }

      if (tempStep === 4) {
        if (!resumeFile) {
          tempErrors.resume = "Resume is required";
        }
      }

      if (tempStep === 5) {
        if (!formData.declarationAccepted) {
          tempErrors.declarationAccepted = "You must accept the declaration";
        }
      }

      allErrors = { ...allErrors, ...tempErrors };
    }

    if (Object.keys(allErrors).length > 0) {
      console.log("Final validation failed:", allErrors);
      setErrors(allErrors);

      // Go to first error step
      if (
        allErrors.fullName ||
        allErrors.dateOfBirth ||
        allErrors.contactNo ||
        allErrors.email ||
        allErrors.permanentAddress
      ) {
        setCurrentStep(1);
      } else if (
        allErrors.universityName ||
        allErrors.degreeProgram ||
        allErrors.expectedGraduationDate
      ) {
        setCurrentStep(2);
      } else if (
        allErrors.positionApplied ||
        allErrors.preferredStartDate ||
        allErrors.preferredEndDate ||
        allErrors.hoursPerWeek
      ) {
        setCurrentStep(3);
      } else if (allErrors.resume) {
        setCurrentStep(4);
      } else if (allErrors.declarationAccepted) {
        setCurrentStep(5);
      }

      return;
    }

    try {
      setLoading(true);

      console.log("Submitting form data...");
      console.log("FullName to be submitted:", formData.fullName);

      const formDataToSend = new FormData();

      const processedData = {
        ...formData,
        relevantSkills: formData.relevantSkills
          ? formData.relevantSkills
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill)
          : [],
        contactNo: formData.contactNo.replace(/\D/g, ""),
        cumulativeGPA: formData.cumulativeGPA
          ? parseFloat(formData.cumulativeGPA)
          : null,
      };

      console.log("Processed data:", processedData);

      formDataToSend.append("data", JSON.stringify(processedData));

      if (resumeFile) formDataToSend.append("resume", resumeFile);
      if (transcriptFile) formDataToSend.append("transcript", transcriptFile);

      otherFiles.forEach((file) => {
        formDataToSend.append("otherDocuments", file);
      });

      console.log("Sending API request...");
      const response = await axios.post("/api/internships", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("API response:", response.data);

      if (response.data.success) {
        onSuccess();
        resetForm();
      }
    } catch (error) {
      console.error("Error:", error);
      console.error("Error response:", error.response);

      let errorMsg = "Error submitting form. Please try again.";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.response.data.errors;
        errorMsg =
          "Please correct the following errors: " +
          Object.values(backendErrors).join(", ");

        // Map backend errors to form errors
        const mappedErrors = {};
        if (backendErrors.fullName)
          mappedErrors.fullName = backendErrors.fullName;
        if (backendErrors.email) mappedErrors.email = backendErrors.email;
        setErrors(mappedErrors);
      }

      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: "",
      gender: "Male",
      dateOfBirth: "",
      nationality: "Indian",
      contactNo: "",
      email: "",
      permanentAddress: "",
      universityName: "",
      degreeProgram: "",
      yearOfStudy: "First Year",
      expectedGraduationDate: "",
      cumulativeGPA: "",
      positionApplied: "",
      preferredStartDate: "",
      preferredEndDate: "",
      hoursPerWeek: "",
      relevantSkills: "",
      declarationAccepted: false,
    });
    setResumeFile(null);
    setTranscriptFile(null);
    setOtherFiles([]);
    setErrors({});
    setCurrentStep(1);
    setDebugInfo("");
  };

  // Get today's date
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h5 className="border-bottom pb-2 mb-4 text-primary">
              <FaUser className="me-2" />
              Personal Information
            </h5>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    isInvalid={!!errors.fullName}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    id="fullNameInput"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fullName}
                  </Form.Control.Feedback>
                  {formData.fullName && (
                    <Form.Text className="text-success">
                      ✓ Entered: {formData.fullName}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Gender *</Form.Label>
                  <div className="d-flex gap-3 mt-2">
                    {["Male", "Female", "Other"].map((gender) => (
                      <Form.Check
                        key={gender}
                        type="radio"
                        label={gender}
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleChange}
                        id={`gender-${gender}`}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date of Birth *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    isInvalid={!!errors.dateOfBirth}
                    max={getTodayDate()}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.dateOfBirth}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nationality *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="e.g., Indian"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Contact Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleChange}
                    isInvalid={!!errors.contactNo}
                    placeholder="10-digit mobile number"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.contactNo}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="your.email@example.com"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Permanent Address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    isInvalid={!!errors.permanentAddress}
                    placeholder="Complete permanent address"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.permanentAddress}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in">
            <h5 className="border-bottom pb-2 mb-4 text-info">
              <FaGraduationCap className="me-2" />
              Educational Background
            </h5>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>University / College Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="universityName"
                    value={formData.universityName}
                    onChange={handleChange}
                    isInvalid={!!errors.universityName}
                    placeholder="Name of your university/college"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.universityName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Degree / Program *</Form.Label>
                  <Form.Control
                    type="text"
                    name="degreeProgram"
                    value={formData.degreeProgram}
                    onChange={handleChange}
                    isInvalid={!!errors.degreeProgram}
                    placeholder="e.g., B.Tech Computer Science"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.degreeProgram}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Year of Study *</Form.Label>
                  <Form.Select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                  >
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                    <option value="Final Year">Final Year</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Expected Graduation Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="expectedGraduationDate"
                    value={formData.expectedGraduationDate}
                    onChange={handleChange}
                    isInvalid={!!errors.expectedGraduationDate}
                    min={getTodayDate()}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.expectedGraduationDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Cumulative GPA (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    name="cumulativeGPA"
                    value={formData.cumulativeGPA}
                    onChange={handleChange}
                    placeholder="e.g., 8.5"
                    isInvalid={!!errors.cumulativeGPA}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cumulativeGPA}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in">
            <h5 className="border-bottom pb-2 mb-4 text-warning">
              <FaBriefcase className="me-2" />
              Internship Details
            </h5>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Internship Position Applied For *</Form.Label>
                  <Form.Control
                    type="text"
                    name="positionApplied"
                    value={formData.positionApplied}
                    onChange={handleChange}
                    isInvalid={!!errors.positionApplied}
                    placeholder="e.g., Software Developer Intern"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.positionApplied}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Preferred Start Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="preferredStartDate"
                    value={formData.preferredStartDate}
                    onChange={handleChange}
                    isInvalid={!!errors.preferredStartDate}
                    min={getTodayDate()}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.preferredStartDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Preferred End Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="preferredEndDate"
                    value={formData.preferredEndDate}
                    onChange={handleChange}
                    isInvalid={!!errors.preferredEndDate}
                    min={formData.preferredStartDate || getTodayDate()}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.preferredEndDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Number of Hours Available per Week *</Form.Label>
                  <Form.Control
                    type="number"
                    name="hoursPerWeek"
                    value={formData.hoursPerWeek}
                    onChange={handleChange}
                    isInvalid={!!errors.hoursPerWeek}
                    min="10"
                    max="40"
                    step="5"
                    placeholder="e.g., 20, 25, 30"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.hoursPerWeek}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in">
            <h5 className="border-bottom pb-2 mb-4 text-success">
              <FaFileAlt className="me-2" />
              Skills & Documents
            </h5>

            <Form.Group className="mb-4">
              <Form.Label>Relevant Skills and Knowledge (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="relevantSkills"
                value={formData.relevantSkills}
                onChange={handleChange}
                placeholder="e.g., JavaScript, React, Python, MongoDB, Git"
              />
            </Form.Group>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Resume (PDF/DOC/DOCX) *
                    {resumeFile && (
                      <Badge bg="success" className="ms-2">
                        ✓ {resumeFile.name}
                      </Badge>
                    )}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange(setResumeFile)}
                    isInvalid={!!errors.resume}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.resume}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Transcript (Optional)
                    {transcriptFile && (
                      <Badge bg="success" className="ms-2">
                        ✓ {transcriptFile.name}
                      </Badge>
                    )}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange(setTranscriptFile)}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    Other Documents (Optional)
                    {otherFiles.length > 0 && (
                      <Badge bg="success" className="ms-2">
                        ✓ {otherFiles.length} file(s) selected
                      </Badge>
                    )}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleMultipleFiles}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case 5:
        return (
          <div className="animate-fade-in">
            <h5 className="border-bottom pb-2 mb-4 text-danger">
              <FaCheckCircle className="me-2" />
              Declaration
            </h5>

            <div className="p-4 border rounded bg-light">
              <Form.Check
                type="checkbox"
                id="declaration"
                name="declarationAccepted"
                checked={formData.declarationAccepted}
                onChange={handleChange}
                label={
                  <div>
                    <strong className="text-danger">Declaration: </strong>I
                    hereby declare that the information provided in this form is
                    true and accurate to the best of my knowledge. I understand
                    that any false information may result in the rejection of my
                    application or termination of the internship if accepted.
                  </div>
                }
                isInvalid={!!errors.declarationAccepted}
                className="fs-6"
              />
              <Form.Control.Feedback type="invalid">
                {errors.declarationAccepted}
              </Form.Control.Feedback>
            </div>

            {/* Summary Preview */}
            <div className="mt-4 p-3 border rounded">
              <h6 className="mb-3">Application Summary</h6>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Name:</strong> {formData.fullName || "Not provided"}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email || "Not provided"}
                  </p>
                  <p>
                    <strong>University:</strong>{" "}
                    {formData.universityName || "Not provided"}
                  </p>
                  <p>
                    <strong>Degree:</strong>{" "}
                    {formData.degreeProgram || "Not provided"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Position:</strong>{" "}
                    {formData.positionApplied || "Not provided"}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {formData.preferredStartDate
                      ? `${formData.preferredStartDate} to ${formData.preferredEndDate}`
                      : "Not provided"}
                  </p>
                  <p>
                    <strong>Hours/Week:</strong>{" "}
                    {formData.hoursPerWeek || "Not provided"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge bg="warning">Pending Submission</Badge>
                  </p>
                </Col>
              </Row>

              {/* Debug Info */}
              <div className="mt-3">
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={showDebugInfo}
                  className="me-2"
                >
                  Debug Info
                </Button>

                {debugInfo && (
                  <pre className="mt-2 p-2 bg-light border rounded small">
                    {debugInfo}
                  </pre>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        onHide();
        resetForm();
      }}
      size="lg"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaUser className="me-2" />
          Internship Application
          <Badge bg="light" text="dark" className="ms-2">
            Step {currentStep} of {steps.length}
          </Badge>
        </Modal.Title>
      </Modal.Header>

      <Form
        onSubmit={currentStep === 5 ? handleSubmit : (e) => e.preventDefault()}
      >
        <Modal.Body style={{ minHeight: "400px" }}>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="text-center">
                    <div
                      className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                        currentStep >= step.id
                          ? `bg-${step.color} text-white`
                          : "bg-light text-secondary"
                      }`}
                      style={{ width: "40px", height: "40px" }}
                    >
                      {step.icon}
                    </div>
                    <div className="small mt-1">{step.title}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-grow-1 border-top mx-2 ${
                        currentStep > step.id
                          ? `border-${step.color}`
                          : "border-light"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="progress" style={{ height: "5px" }}>
              <div
                className={`progress-bar bg-${steps[currentStep - 1].color}`}
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Error Alert */}
          {errors.general && (
            <Alert variant="danger" className="mb-3">
              {errors.general}
            </Alert>
          )}

          {/* Step Content */}
          <div className="step-content">{renderStepContent()}</div>
        </Modal.Body>

        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <Button
              variant="outline-secondary"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
            >
              ← Previous
            </Button>

            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  onHide();
                  resetForm();
                }}
                disabled={loading}
              >
                Cancel
              </Button>

              {currentStep < steps.length ? (
                <Button
                  variant={`outline-${steps[currentStep - 1].color}`}
                  onClick={handleNext}
                  className="px-4"
                >
                  Next Step →
                </Button>
              ) : (
                <Button
                  variant="success"
                  type="submit"
                  disabled={loading}
                  className="px-4"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application ✓"
                  )}
                </Button>
              )}
            </div>
          </div>
        </Modal.Footer>
      </Form>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .step-content {
          transition: all 0.3s ease;
        }

        .progress-bar {
          transition: width 0.5s ease-in-out;
        }
      `}</style>
    </Modal>
  );
};

export default InternshipForm;
