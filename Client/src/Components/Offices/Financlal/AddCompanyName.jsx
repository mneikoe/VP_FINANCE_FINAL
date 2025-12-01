import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { fetchFinancialProduct } from "../../../redux/feature/FinancialProduct/FinancialThunx";

import { ToastContainer, toast } from "react-toastify";
import { resetCompanyNameStatus } from "../../../redux/feature/ComapnyName/CompanySlice";
import {
  createCompanyName,
  fetchCompanyNameById,
  updateCompanyName,
} from "../../../redux/feature/ComapnyName/CompanyThunx";
const initialFormState = {
  financialProduct: "",
  companyName: "",
  localOfficeAddress: "",
  contactNo: "",
  emailId: "",
  branchManagerMobile: "",
  headOfficeAddress: "",
  headOfficeContact: "",
  headOfficeEmail: "",
  website: "",
  relationshipManagerName: "",
  relationshipManagerDOB: "",
  relationshipManagerMobile: "",
  relationshipManagerEmail: "",
  agencyCode: "",
  portalLink: "",
  alternatePortalLink: "",
  loginCredentials: [
    { loginName: "", username: "", password: "" },
    { loginName: "", username: "", password: "" },
    { loginName: "", username: "", password: "" },
  ],
  appDetails: [
    { appName: "", appUsername: "", appPassword: "" },
    { appName: "", appUsername: "", appPassword: "" },
  ],
};
function AddCompanyName({ editId, setActiveTab, setEditId }) {
  const dispatch = useDispatch();
  const financialProduct = useSelector((state) => state.financialProduct);
  const companyState = useSelector((state) => state.CompanyName);
  const { loading, error, success } = companyState;
  const [formData, setFormData] = useState(initialFormState);
  useEffect(() => {
    if (editId) {
      dispatch(fetchCompanyNameById(editId)); // ✅ Now safe to use
    } else {
      setFormData(initialFormState);
    }
  }, [editId, dispatch]);

  const { selectedCompany } = companyState;
  useEffect(() => {
    if (editId && selectedCompany && selectedCompany._id === editId) {
      setFormData({
        ...initialFormState,
        ...selectedCompany,
      });
    }
  }, [editId, selectedCompany]);

  useEffect(() => {
    dispatch(fetchFinancialProduct());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      if (editId) {
        toast.success("Company updated successfully!");
      } else {
        toast.success("Company created successfully!");
      }

      setFormData(initialFormState);
      setEditId(null); // Optional: reset edit mode
      setActiveTab("view"); // Optional: switch tab after save/update
      dispatch(resetCompanyNameStatus());
    }

    if (error) {
      toast.error(error || "Something went wrong!");
      dispatch(resetCompanyNameStatus());
    }
  }, [success, error, editId, dispatch, setActiveTab, setEditId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoginCredentialsChange = (index, field, value) => {
    const updated = [...formData.loginCredentials];
    updated[index][field] = value;
    setFormData({ ...formData, loginCredentials: updated });
  };

  const handleAppDetailsChange = (index, field, value) => {
    const updated = [...formData.appDetails];
    updated[index][field] = value;
    setFormData({ ...formData, appDetails: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateCompanyName({ id: editId, CompanyNameData: formData }));
    } else {
      dispatch(createCompanyName(formData));
    }
  };

  return (
    <>
      <Form className="p-3 border rounded" onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Financial Product</Form.Label>
              <Form.Select
                value={formData.financialProduct}
                onChange={(e) =>
                  handleChange("financialProduct", e.target.value)
                }
                required
                disabled={loading}
              >
                <option value="">Choose Financial Product --</option>
                {financialProduct.loading && (
                  <option disabled>Loading...</option>
                )}
                {!financialProduct.loading &&
                  financialProduct.FinancialProducts?.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Local Office Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.localOfficeAddress}
                onChange={(e) =>
                  handleChange("localOfficeAddress", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Contact No</Form.Label>
              <Form.Control
                type="text"
                value={formData.contactNo}
                onChange={(e) => handleChange("contactNo", e.target.value)}
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email Id</Form.Label>
              <Form.Control
                type="email"
                value={formData.emailId}
                onChange={(e) => handleChange("emailId", e.target.value)}
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Branch Manager Mobile</Form.Label>
              <Form.Control
                type="text"
                value={formData.branchManagerMobile}
                onChange={(e) =>
                  handleChange("branchManagerMobile", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Head Office Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.headOfficeAddress}
                onChange={(e) =>
                  handleChange("headOfficeAddress", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Head Office Contact</Form.Label>
              <Form.Control
                type="text"
                value={formData.headOfficeContact}
                onChange={(e) =>
                  handleChange("headOfficeContact", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Head Office Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.headOfficeEmail}
                onChange={(e) =>
                  handleChange("headOfficeEmail", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="text"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Relationship Manager Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.relationshipManagerName}
                onChange={(e) =>
                  handleChange("relationshipManagerName", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Relationship Manager DOB</Form.Label>
              <Form.Control
                type="date"
                value={formData.relationshipManagerDOB}
                onChange={(e) =>
                  handleChange("relationshipManagerDOB", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Relationship Manager Mobile</Form.Label>
              <Form.Control
                type="text"
                value={formData.relationshipManagerMobile}
                onChange={(e) =>
                  handleChange("relationshipManagerMobile", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Relationship Manager Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.relationshipManagerEmail}
                onChange={(e) =>
                  handleChange("relationshipManagerEmail", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Agency Code</Form.Label>
              <Form.Control
                type="text"
                value={formData.agencyCode}
                onChange={(e) => handleChange("agencyCode", e.target.value)}
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Portal Link</Form.Label>
              <Form.Control
                type="text"
                value={formData.portalLink}
                onChange={(e) => handleChange("portalLink", e.target.value)}
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Alternate Portal Link</Form.Label>
              <Form.Control
                type="text"
                value={formData.alternatePortalLink}
                onChange={(e) =>
                  handleChange("alternatePortalLink", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
          </Col>

          {[0, 1, 2].map((idx) => (
            <React.Fragment key={`loginGroup${idx}`}>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Login Name {idx + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.loginCredentials[idx].loginName}
                    onChange={(e) =>
                      handleLoginCredentialsChange(
                        idx,
                        "loginName",
                        e.target.value
                      )
                    }
                    disabled={loading}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Username {idx + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.loginCredentials[idx].username}
                    onChange={(e) =>
                      handleLoginCredentialsChange(
                        idx,
                        "username",
                        e.target.value
                      )
                    }
                    disabled={loading}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Password {idx + 1}</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.loginCredentials[idx].password}
                    onChange={(e) =>
                      handleLoginCredentialsChange(
                        idx,
                        "password",
                        e.target.value
                      )
                    }
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </React.Fragment>
          ))}

          {[0, 1].map((idx) => (
            <React.Fragment key={`appGroup${idx}`}>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>App Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.appDetails[idx].appName}
                    onChange={(e) =>
                      handleAppDetailsChange(idx, "appName", e.target.value)
                    }
                    disabled={loading}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>App Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.appDetails[idx].appUsername}
                    onChange={(e) =>
                      handleAppDetailsChange(idx, "appUsername", e.target.value)
                    }
                    disabled={loading}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>App Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.appDetails[idx].appPassword}
                    onChange={(e) =>
                      handleAppDetailsChange(idx, "appPassword", e.target.value)
                    }
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </React.Fragment>
          ))}

          <Col md={12}>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : editId ? "Update" : "Save"}
            </Button>
          </Col>
        </Row>
      </Form>
      <ToastContainer />
    </>
  );
}

export default AddCompanyName;
