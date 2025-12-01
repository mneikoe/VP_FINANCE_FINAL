import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchFinancialProduct } from "../../../../redux/feature/FinancialProduct/FinancialThunx";
import {
  createRegistrar,
  getRegistrarById,
  updateRegistrar,
} from "../../../../redux/feature/Registrar/RegistrarThunx";
import { toast } from "react-toastify";
import { resetRegistrarStatus } from "../../../../redux/feature/Registrar/RegistrarSlice";

// initial data
const initialFormState = {
  financialProduct: "",
  arn1: "",
  euin1: "",
  expiry1: "",
  nimsEmail1: "",
  nimsPassword1: "",
  arn2: "",
  euin2: "",
  expiry2: "",
  nimsEmail2: "",
  nimsPassword2: "",
  registrarName: "",
  localOfficeAddress: "",
  contactNo: "",
  emailId: "",
  branchManager: "",
  branchManagerMobile: "",
  headOfficeAddress: "",
  headOfficeContact: "",
  headOfficeEmail: "",
  website: "",
  rmName: "",
  rmDOB: "",
  rmMobile: "",
  rmEmail: "",
  portalLink: "",
  altPortalLink: "",
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
  remark: "",
};

function Registrar({ editId, setActiveTab, setEditId }) {
  const [formData, setFormData] = useState(initialFormState);
  const dispatch = useDispatch();
  const financialProduct = useSelector((state) => state.financialProduct);
  const registrarState = useSelector((state) => state.registrar);

  const { loading, error, success } = registrarState;

  // fetch financial product

  useEffect(() => {
    dispatch(fetchFinancialProduct());
  }, [dispatch]);

  // eidt update
  useEffect(() => {
    if (editId) {
      dispatch(getRegistrarById(editId)); // ✅ Now safe to use
    } else {
      setFormData(initialFormState);
    }
  }, [editId, dispatch]);

  const { selectedRegistrar } = useSelector((state) => state.registrar);
  useEffect(() => {
    if (editId && selectedRegistrar && selectedRegistrar._id === editId) {
      setFormData({
        ...initialFormState,
        ...selectedRegistrar,
      });
    }
  }, [editId, selectedRegistrar]);
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
      dispatch(resetRegistrarStatus());
    }

    if (error) {
      toast.error(error || "Something went wrong!");
      dispatch(resetRegistrarStatus());
    }
  }, [success, error, editId, dispatch, setActiveTab, setEditId]);

  // handle change

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateRegistrar({ id: editId, registrarData: formData }));
    } else {
      dispatch(createRegistrar(formData));
    }
    console.log(formData);
    // dispatch logic here

    setActiveTab("view");
  };

  const renderInput = (field, label, type = "text", placeholder = "") => (
    <Form.Group controlId={field}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        value={formData[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
      />
    </Form.Group>
  );

  return (
    <div className="p-4 border rounded">
      <h5 className="text-center mb-4">MUTUAL FUND</h5>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Financial Product</Form.Label>
              <Form.Select
                value={formData.financialProduct}
                onChange={(e) =>
                  handleChange("financialProduct", e.target.value)
                }
                required
              >
                <option value="">Choose Financial Product --</option>
                {financialProduct.loading && (
                  <option disabled>Loading...</option>
                )}
                {!financialProduct.loading &&
                  financialProduct.FinancialProducts?.map((item) => (
                    <option key={item._id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            {renderInput("arn1", "ARN No 1", "text", "Enter ARN No 1")}
          </Col>
          <Col md={3}>
            {renderInput("euin1", "EUIN No 1", "text", "Enter EUIN No 1")}
          </Col>
          <Col md={3}>{renderInput("expiry1", "Expiry Date 1", "date")}</Col>
        </Row>

        <Row className="mt-3">
          <Col md={3}>
            {renderInput(
              "nimsEmail1",
              "NIMS Email 1",
              "email",
              "Enter NIMS Email 1"
            )}
          </Col>
          <Col md={3}>
            {renderInput(
              "nimsPassword1",
              "NIMS Password 1",
              "password",
              "Enter NIMS Password 1"
            )}
          </Col>
          <Col md={3}>
            {renderInput("arn2", "ARN No 2", "text", "Enter ARN No 2")}
          </Col>
          <Col md={3}>
            {renderInput("euin2", "EUIN No 2", "text", "Enter EUIN No 2")}
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={3}>{renderInput("expiry2", "Expiry Date 2", "date")}</Col>
          <Col md={3}>
            {renderInput(
              "nimsEmail2",
              "NIMS Email 2",
              "email",
              "Enter NIMS Email 2"
            )}
          </Col>
          <Col md={3}>
            {renderInput(
              "nimsPassword2",
              "NIMS Password 2",
              "password",
              "Enter NIMS Password 2"
            )}
          </Col>
        </Row>

        <h5 className="text-center mt-4 mb-3">REGISTRAR</h5>

        <Row>
          <Col md={3}>
            {renderInput(
              "registrarName",
              "Registrar Name",
              "text",
              "Enter Registrar Name"
            )}
          </Col>
          <Col md={3}>
            {renderInput(
              "localOfficeAddress",
              "Local Office Address",
              "text",
              "Enter Local Office Address"
            )}
          </Col>
          <Col md={3}>
            {renderInput("contactNo", "Contact No", "text", "Enter Contact No")}
          </Col>
          <Col md={3}>
            {renderInput("emailId", "Email Id", "email", "Enter Email Id")}
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={3}>
            {renderInput(
              "branchManager",
              "Branch Manager Name",
              "text",
              "Enter Branch Manager Name"
            )}
          </Col>
          <Col md={3}>
            {renderInput(
              "branchManagerMobile",
              "Branch Manager Mobile",
              "text",
              "Enter Branch Manager Mobile"
            )}
          </Col>
          <Col md={3}>
            {renderInput(
              "headOfficeAddress",
              "Head Office Address",
              "text",
              "Enter Head Office Address"
            )}
          </Col>
          <Col md={3}>
            {renderInput(
              "headOfficeContact",
              "Head Office Contact",
              "text",
              "Enter Head Office Contact"
            )}
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={3}>
            {renderInput(
              "headOfficeEmail",
              "Head Office Email",
              "email",
              "Enter Head Office Email"
            )}
          </Col>
          <Col md={3}>
            {renderInput("website", "Website", "text", "Enter Website URL")}
          </Col>
          <Col md={3}>
            {renderInput(
              "rmName",
              "Relationship Manager Name",
              "text",
              "Enter RM Name"
            )}
          </Col>
          <Col md={3}>
            {renderInput("rmDOB", "Relationship Manager DOB", "date")}
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={3}>
            {renderInput(
              "rmMobile",
              "Relationship Manager Mobile",
              "text",
              "Enter RM Mobile"
            )}
          </Col>
          <Col md={3}>
            {renderInput(
              "rmEmail",
              "Relationship Manager Email",
              "email",
              "Enter RM Email"
            )}
          </Col>
          <Col md={3}>
            {renderInput(
              "portalLink",
              "Portal Link",
              "text",
              "Enter Portal Link"
            )}
          </Col>
          <Col md={3}>
            {renderInput(
              "altPortalLink",
              "Alternate Portal Link",
              "text",
              "Enter Alternate Portal Link"
            )}
          </Col>
        </Row>

        <Row className="mt-3">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <Col md={3}>
                {renderInput(
                  `loginName${num}`,
                  `Login Name ${num}`,
                  "text",
                  `Enter Login Name ${num}`
                )}
              </Col>
              <Col md={3}>
                {renderInput(
                  `username${num}`,
                  `Username ${num}`,
                  "text",
                  `Enter Username ${num}`
                )}
              </Col>
              <Col md={3}>
                {renderInput(
                  `password${num}`,
                  `Password ${num}`,
                  "password",
                  `Enter Password ${num}`
                )}
              </Col>
            </React.Fragment>
          ))}
        </Row>

        <Row className="mt-3">
          {[1, 2].map((num) => (
            <React.Fragment key={num}>
              <Col md={3}>
                {renderInput(
                  `appName${num}`,
                  "App Name",
                  "text",
                  "Enter App Name"
                )}
              </Col>
              <Col md={3}>
                {renderInput(
                  `appUsername${num}`,
                  "App Username",
                  "text",
                  "Enter App Username"
                )}
              </Col>
              <Col md={3}>
                {renderInput(
                  `appPassword${num}`,
                  "App Password",
                  "password",
                  "Enter App Password"
                )}
              </Col>
            </React.Fragment>
          ))}
        </Row>

        <Row className="mt-3">
          <Col md={12}>
            <Form.Group controlId="remark">
              <Form.Label>Remark</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.remark}
                onChange={(e) => handleChange("remark", e.target.value)}
                placeholder="Enter Remarks"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : editId ? "Update" : "Save"}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default Registrar;
