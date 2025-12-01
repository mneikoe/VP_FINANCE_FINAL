import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { FaPlus, FaTrash, FaPaperclip, FaCheck } from "react-icons/fa";
import {
  clearError,
  clearSuccessMessage,
} from "../../../redux/feature/ServiceTask/ServiceSlice";
import {
  createServiceTask,
  updateServiceTask,
} from "../../../redux/feature/ServiceTask/ServiceThunx";
import { fetchFinancialProduct } from "../../../redux/feature/FinancialProduct/FinancialThunx";
import { fetchCompanyName } from "../../../redux/feature/ComapnyName/CompanyThunx";
const ServicingAddtask = ({ on, data }) => {
  const dispatch = useDispatch();

  const { loading, error, successMessage } = useSelector(
    (state) => state.ServiceTask
  );

  const [formData, setFormData] = useState({
    cat: "",
    sub: "",
    depart: "",
    name: "",
    type: "service",
    descp: { text: "", image: null },
    email_descp: "",
    sms_descp: "",
    whatsapp_descp: "",
    checklists: [""],
    formChecklists: [{ name: "", downloadFormUrl: null, sampleFormUrl: null }],
  });

  // fetch financialProduct
  useEffect(() => {
    dispatch(fetchFinancialProduct());
    dispatch(fetchCompanyName());
  }, [dispatch]);

  // financial Product
  const products = useSelector(
    (state) => state.financialProduct.FinancialProducts || []
  );

  // company name
  const company = useSelector((state) => state.CompanyName.CompanyNames || []);
  // filter company name according to financial productconst filteredCompanies = company.filter(
  const filteredCompanies = company.filter(
    (item) => item.financialProduct?._id === formData.cat
  );

  console.log(filteredCompanies, "Filter Company Name");

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const [activeTab, setActiveTab] = useState("tab_1");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      setSubmitSuccess(true);
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (name === "descpImage") {
        setFormData((prev) => ({
          ...prev,
          descp: { ...prev.descp, image: files[0] },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // For form checklist files
  const updateFormChecklist = (index, field, value) => {
    const newFormChecklists = [...formData.formChecklists];
    if (value instanceof File) {
      newFormChecklists[index][field] = value;
    } else {
      newFormChecklists[index][field] = value;
    }
    setFormData((prev) => ({ ...prev, formChecklists: newFormChecklists }));
  };

  const handleEditorChange = (editor, data, field) => {
    if (field === "descp") {
      // For description, we need to preserve the image property
      setFormData((prev) => ({
        ...prev,
        descp: { ...prev.descp, text: data },
      }));
    } else {
      // For other editors (email, sms, whatsapp)
      setFormData((prev) => ({ ...prev, [field]: data }));
    }
  };
  const addChecklist = () => {
    setFormData((prev) => ({
      ...prev,
      checklists: [...prev.checklists, ""],
    }));
  };

  const updateChecklist = (index, value) => {
    const newChecklists = [...formData.checklists];
    newChecklists[index] = value;
    setFormData((prev) => ({ ...prev, checklists: newChecklists }));
  };

  const removeChecklist = (index) => {
    const newChecklists = [...formData.checklists];
    newChecklists.splice(index, 1);
    setFormData((prev) => ({ ...prev, checklists: newChecklists }));
  };

  const addFormChecklist = () => {
    setFormData((prev) => ({
      ...prev,
      formChecklists: [...prev.formChecklists, { name: "", file: null }],
    }));
  };

  const removeFormChecklist = (index) => {
    const newFormChecklists = [...formData.formChecklists];
    newFormChecklists.splice(index, 1);
    setFormData((prev) => ({ ...prev, formChecklists: newFormChecklists }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare form data
      console.log(FormData, "DAS");
      const formDataToSend = new FormData();

      // Add all text fields
      formDataToSend.append("cat", formData.cat);
      formDataToSend.append("sub", formData.sub);
      formDataToSend.append("depart", formData.depart);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("type", formData.type);
      // formDataToSend.append("descpText", formData.descp.text);
      formDataToSend.append("descpText", formData.descp.text || "");
      formDataToSend.append("email_descp", formData.email_descp);
      formDataToSend.append("sms_descp", formData.sms_descp);
      formDataToSend.append("whatsapp_descp", formData.whatsapp_descp);

      // Add checklists as array
      formData.checklists.forEach((item, index) => {
        formDataToSend.append(`checklists[${index}]`, item);
      });

      // Add formChecklists as JSON string
      formDataToSend.append(
        "formChecklists",
        JSON.stringify(formData.formChecklists)
      );

      // Add files if they exist
      if (formData.descp.image) {
        formDataToSend.append("image", formData.descp.image);
      }

      // Add form files
      formData.formChecklists.forEach((item) => {
        if (item.downloadFormUrl instanceof File) {
          formDataToSend.append("downloadFormUrl", item.downloadFormUrl);
        }
        if (item.sampleFormUrl instanceof File) {
          formDataToSend.append("sampleFormUrl", item.sampleFormUrl);
        }
      });

      if (data) {
        await dispatch(
          updateServiceTask({ id: data._id, formData: formDataToSend })
        );
      } else {
        await dispatch(createServiceTask(formDataToSend));
      }

      // Reset form
      setFormData({
        cat: "",
        sub: "",
        depart: "",
        name: "",
        type: "service",
        descp: { text: "", image: null },
        email_descp: "",
        sms_descp: "",
        whatsapp_descp: "",
        checklists: [""],
        formChecklists: [
          { name: "", downloadFormUrl: null, sampleFormUrl: null },
        ],
      });

      // Switch to view mode
      on("view");

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to save task: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabConfig = [
    { id: "tab_1", label: "Work Description", icon: "📝" },
    { id: "tab_2", label: "Checklist", icon: "✅" },
    { id: "tab_6", label: "Download Forms", icon: "📄" },
    { id: "tab_3", label: "Email Templates", icon: "✉️" },
    { id: "tab_4", label: "SMS Templates", icon: "📱" },
    { id: "tab_5", label: "WhatsApp Templates", icon: "💬" },
  ];
  // { id: "tab_7", label: "Sample Form", icon: "📋" },

  return (
    <div className="">
      <div className="card shadow-lg">
        <div className="card-header  text-black">
          <h3 className="card-title mt-4 text-center">Servicing Task Form</h3>
          <div className="card-tools">
            <button
              type="button"
              className="btn btn-tool"
              data-card-widget="collapse"
            >
              <i className="fas fa-minus"></i>
            </button>
          </div>
        </div>

        <form
          id="forming"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="font-weight-bold">Financial Product</label>
                  <select
                    name="cat"
                    className="form-control select2"
                    onChange={handleChange}
                    value={formData.cat}
                  >
                    <option value="">Choose Financial Product</option>
                    {Array.isArray(products) &&
                      products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="font-weight-bold">Company Name</label>
                  <select
                    name="sub"
                    className="form-control select2"
                    value={formData.sub}
                    onChange={handleChange}
                  >
                    <option value="">Choose Company Name</option>
                    {filteredCompanies.map((comp) => (
                      <option key={comp.id} value={comp.companyName}>
                        {comp.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row ">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="font-weight-bold">Employee Type</label>
                  <select
                    name="depart"
                    className="form-control select2"
                    value={formData.depart}
                    onChange={handleChange}
                  >
                    <option value="">Choose Employee</option>
                    <option value="OA">OA</option>
                    <option value="OE">OE</option>
                    <option value="CRE">CRE</option>
                    <option value="Telemarketer">Telemarketer</option>
                    <option value="Telecaller">Telecaller</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="font-weight-bold">Task Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter task name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <input type="hidden" name="type" value="composite" />

            <div className="nav-tabs-custom mt-4">
              <ul className="nav nav-pills nav-fill mb-4">
                {tabConfig.map((tab) => (
                  <li key={tab.id} className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${
                        activeTab === tab.id ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        backgroundColor: activeTab === tab.id ? "#2B3A4A" : "",
                        color: activeTab === tab.id ? "#fff" : "black",
                        transition: "0.3s ease",
                      }}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="tab-content p-3 border border-top-0 rounded-bottom">
                {/* Work Description Tab */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_1" ? "show active" : ""
                  }`}
                  id="tab_1"
                >
                  <div className="card">
                    <div className="card-header bg-light">
                      <h4 className="card-title">Work Description</h4>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label>Detailed Description</label>
                        <CKEditor
                          editor={ClassicEditor}
                          data={formData?.descp?.text || ""} // Fallback to empty string
                          onChange={(event, editor) =>
                            handleEditorChange(
                              editor,
                              editor.getData(),
                              "descp"
                            )
                          }
                          config={{
                            toolbar: [
                              "heading",
                              "|",
                              "bold",
                              "italic",
                              "link",
                              "bulletedList",
                              "numberedList",
                              "blockQuote",
                              "imageUpload", // Add this
                              "undo",
                              "redo",
                            ],
                          }}
                        />
                        <div className="form-group mt-4">
                          <label>Attach File</label>
                          <div className="custom-file">
                            <input
                              type="file"
                              name="descpImage"
                              className="custom-file-input"
                              id="customFile"
                              onChange={handleChange}
                            />
                            <label
                              className="custom-file-label"
                              htmlFor="customFile"
                            >
                              {/* {formData.descp.image
                                ? formData.descp.image.name
                                : "Choose file"} */}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checklist Template Tab */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_2" ? "show active" : ""
                  }`}
                  id="tab_2"
                >
                  <div className="card">
                    <div className="card-header bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <h4 className="card-title">Checklist Items</h4>
                        <button
                          style={{ backgroundColor: "#2B3A4A", color: "white" }}
                          type="button"
                          className="btn btn-sm "
                          onClick={addChecklist}
                        >
                          <FaPlus className="mr-1" /> Add Item
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      {formData.checklists.map((checklist, index) => (
                        <div
                          key={index}
                          className="form-group row align-items-center mb-3"
                        >
                          <div className="col-sm-10">
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  {index + 1}
                                </span>
                              </div>
                              <input
                                type="text"
                                className="form-control"
                                placeholder={`Checklist item ${index + 1}`}
                                value={checklist}
                                onChange={(e) =>
                                  updateChecklist(index, e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="col-sm-2">
                            {index > 0 && (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removeChecklist(index)}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Email Templates Tab */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_3" ? "show active" : ""
                  }`}
                  id="tab_3"
                >
                  <div className="card">
                    <div className="card-header bg-light">
                      <h4 className="card-title">Email Template</h4>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label>Email Content</label>
                        <CKEditor
                          editor={ClassicEditor}
                          data={formData.email_descp}
                          onChange={(event, editor) =>
                            handleEditorChange(
                              editor,
                              editor.getData(),
                              "email_descp"
                            )
                          }
                          config={{
                            toolbar: [
                              "heading",
                              "|",
                              "bold",
                              "italic",
                              "link",
                              "bulletedList",
                              "numberedList",
                              "blockQuote",
                              "undo",
                              "redo",
                            ],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Templates Tab */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_4" ? "show active" : ""
                  }`}
                  id="tab_4"
                >
                  <div className="card">
                    <div className="card-header bg-light">
                      <h4 className="card-title">SMS Template</h4>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label>SMS Content</label>
                        <CKEditor
                          editor={ClassicEditor}
                          data={formData.sms_descp}
                          onChange={(event, editor) =>
                            handleEditorChange(
                              editor,
                              editor.getData(),
                              "sms_descp"
                            )
                          }
                          config={{
                            toolbar: ["bold", "italic", "|", "undo", "redo"],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Whatsapp Templates Tab */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_5" ? "show active" : ""
                  }`}
                  id="tab_5"
                >
                  <div className="card">
                    <div className="card-header bg-light">
                      <h4 className="card-title">WhatsApp Template</h4>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label>WhatsApp Message</label>
                        <CKEditor
                          editor={ClassicEditor}
                          data={formData.whatsapp_descp}
                          onChange={(event, editor) =>
                            handleEditorChange(
                              editor,
                              editor.getData(),
                              "whatsapp_descp"
                            )
                          }
                          config={{
                            toolbar: ["bold", "italic", "|", "undo", "redo"],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Forms Tab */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_6" ? "show active" : ""
                  }`}
                  id="tab_6"
                >
                  <div className="card">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h4 className="card-title mb-0">Form Checklists</h4>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ backgroundColor: "#2B3A4A", color: "white" }}
                        onClick={addFormChecklist}
                      >
                        <FaPlus className="mr-1" /> Add Form
                      </button>
                    </div>
                    <div className="card-body">
                      {formData.formChecklists.map((item, index) => (
                        <div
                          key={index}
                          className="border rounded p-3 mb-3 d-flex g-4 justify-content-between w-100"
                        >
                          <div className="form-group ">
                            <label>Form Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={item.name}
                              onChange={(e) =>
                                updateFormChecklist(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder={`Form name ${index + 1}`}
                            />
                          </div>

                          <div className="form-group">
                            <label>Blank Form</label>
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) =>
                                updateFormChecklist(
                                  index,
                                  "downloadFormUrl",
                                  e.target.files[0]
                                )
                              }
                            />
                            {item.downloadFormUrl &&
                              typeof item.downloadFormUrl === "string" && (
                                <small className="text-success">
                                  Existing file: {item.downloadFormUrl}
                                </small>
                              )}
                          </div>

                          <div className="form-group">
                            <label>Sample Form</label>
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) =>
                                updateFormChecklist(
                                  index,
                                  "sampleFormUrl",
                                  e.target.files[0]
                                )
                              }
                            />
                            {item.sampleFormUrl &&
                              typeof item.sampleFormUrl === "string" && (
                                <small className="text-success">
                                  Existing file: {item.sampleFormUrl}
                                </small>
                              )}
                          </div>

                          <div className="text-right">
                            {index > 0 && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm mt-4"
                                onClick={() => removeFormChecklist(index)}
                              >
                                <FaTrash className="mr-1" />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer text-center">
            <button
              style={{ backgroundColor: "#2B3A4A", color: "white" }}
              type="submit"
              className="btn btn-lg px-5"
              disabled={loading} // from Redux state
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm mr-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </>
              ) : submitSuccess ? (
                <>
                  <FaCheck className="mr-2" />{" "}
                  {data ? "Updated Successfully!" : "Submitted Successfully!"}
                </>
              ) : (
                <>{data ? "Update" : "Submit"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServicingAddtask;
