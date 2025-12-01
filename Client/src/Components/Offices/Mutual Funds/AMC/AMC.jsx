import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  createAMC,
  getAMCById,
  updateAMC,
} from "../../../../redux/feature/AMC/AMCThunx";
import { resetAMCStatus } from "../../../../redux/feature/AMC/AMCSlice";
import { fetchRegistrars } from "../../../../redux/feature/Registrar/RegistrarThunx";

const initialFormState = {
  registrar: "",
  amcName: "",
  localAddress: "",
  contactNo: "",
  email: "",
  branchManagerName: "",
  branchManagerMobile: "",
  headOfficeAddress: "",
  headOfficeContact: "",
  headOfficeEmail: "",
  website: "",
  rmName: "",
  rmDob: "",
  rmMobile: "",
  rmEmail: "",
  portalLink: "",
  alternatePortalLink: "",
  loginName1: "",
  username1: "",
  password1: "",
  loginName2: "",
  username2: "",
  password2: "",
  loginName3: "",
  username3: "",
  password3: "",
  appName1: "",
  appUsername1: "",
  appPassword1: "",
  appName2: "",
  appUsername2: "",
  appPassword2: "",
  extraRemark: "",
};

function AMC({ editId, setActiveTab, setEditId }) {
  const [formData, setFormData] = useState(initialFormState);
  const dispatch = useDispatch();
  const registrarAMC = useSelector((state) => state.registrar);
  console.log(registrarAMC, "registrar");
  const AMCState = useSelector((state) => state.AMC);
  const { loading, error, success } = AMCState;

  useEffect(() => {
    dispatch(fetchRegistrars());
  }, [dispatch]);

  useEffect(() => {
    if (editId) {
      dispatch(getAMCById(editId));
    } else {
      setFormData(initialFormState);
    }
  }, [editId, dispatch]);

  const { selectedAMC } = useSelector((state) => state.AMC); // from AMC slice now

  useEffect(() => {
    if (editId && selectedAMC && selectedAMC._id === editId) {
      // Map only keys present in formData to avoid extra keys from API
      const filteredData = {};
      Object.keys(initialFormState).forEach((key) => {
        filteredData[key] = selectedAMC[key] ?? ""; // fallback to empty string if missing
      });
      setFormData(filteredData);
    }
  }, [editId, selectedAMC]);

  useEffect(() => {
    if (success) {
      toast.success(
        editId ? "AMC updated successfully!" : "AMC created successfully!"
      );
      setFormData(initialFormState);
      setEditId(null);
      setActiveTab("view");
      dispatch(resetAMCStatus());
    }

    if (error) {
      toast.error(error || "Something went wrong!");
      dispatch(resetAMCStatus());
    }
  }, [success, error, editId, dispatch, setActiveTab, setEditId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateAMC({ id: editId, AMCData: formData }));
    } else {
      dispatch(createAMC(formData));
    }
    setActiveTab("view");
  };

  return (
    <div className="p-4 border rounded">
      <h5 className="text-center mb-4">AMC Name</h5>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Registrar Name</Form.Label>
              <Form.Select
                value={formData.registrar}
                onChange={(e) => handleChange("registrar", e.target.value)}
                required
              >
                <option value="">Choose Registrar Name --</option>
                {registrarAMC.loading && <option disabled>Loading...</option>}
                {registrarAMC.registrars?.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.registrarName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>AMC Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.amcName}
                onChange={(e) => handleChange("amcName", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>{renderInput("localAddress", "Local Address")}</Col>
          <Col md={4}>{renderInput("contactNo", "Contact No")}</Col>
          <Col md={4}>{renderInput("email", "Email Id")}</Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            {renderInput("branchManagerName", "Branch Manager Name")}
          </Col>
          <Col md={4}>
            {renderInput("branchManagerMobile", "Branch Manager Mobile")}
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            {renderInput("headOfficeAddress", "Head Office Address")}
          </Col>
          <Col md={4}>
            {renderInput("headOfficeContact", "Head Office Contact")}
          </Col>
          <Col md={4}>
            {renderInput("headOfficeEmail", "Head Office Email")}
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>{renderInput("website", "Website")}</Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>{renderInput("rmName", "Relationship Manager Name")}</Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Relationship Manager DOB</Form.Label>
              <Form.Control
                type="date"
                value={formData.rmDob}
                onChange={(e) => handleChange("rmDob", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            {renderInput("rmMobile", "Relationship Manager Mobile")}
          </Col>
          <Col md={3}>
            {renderInput("rmEmail", "Relationship Manager Email")}
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>{renderInput("portalLink", "Portal Link")}</Col>
          <Col md={6}>
            {renderInput("alternatePortalLink", "Alternate Portal Link")}
          </Col>
        </Row>

        {[1, 2, 3].map((i) => (
          <Row className="mb-3" key={i}>
            <Col md={4}>{renderInput(`loginName${i}`, `Login Name ${i}`)}</Col>
            <Col md={4}>{renderInput(`username${i}`, `Username ${i}`)}</Col>
            <Col md={4}>{renderInput(`password${i}`, `Password ${i}`)}</Col>
          </Row>
        ))}

        {[1, 2].map((i) => (
          <Row className="mb-3" key={`app${i}`}>
            <Col md={4}>{renderInput(`appName${i}`, `App Name`)}</Col>
            <Col md={4}>{renderInput(`appUsername${i}`, `App Username`)}</Col>
            <Col md={4}>{renderInput(`appPassword${i}`, `App Password`)}</Col>
          </Row>
        ))}

        <Row className="mb-3">
          <Col>{renderInput("extraRemark", "Extra Remark")}</Col>
        </Row>

        <div className="text-center mt-4">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : editId ? "Update" : "Save"}
          </Button>
        </div>
      </Form>
    </div>
  );

  function renderInput(field, label, type = "text") {
    return (
      <Form.Group controlId={field}>
        <Form.Label>{label}</Form.Label>
        <Form.Control
          type={type}
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      </Form.Group>
    );
  }
}

export default AMC;
