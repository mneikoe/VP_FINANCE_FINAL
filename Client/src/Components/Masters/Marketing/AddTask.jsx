import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { FaPlus, FaTrash, FaBullhorn } from "react-icons/fa";
import {
  clearError,
  clearSuccessMessage,
} from "../../../redux/feature/CompositeTask/CompositeSlice";
import { fetchFinancialProduct } from "../../../redux/feature/FinancialProduct/FinancialThunx";
import { fetchCompanyName } from "../../../redux/feature/ComapnyName/CompanyThunx";
import axios from "axios";

const AddTaskMarketing = ({ on, data, onSuccess }) => {
  const dispatch = useDispatch();

  // Flatten the data for easier access
  const flat = data?.task
    ? {
        ...data.task,
        category: data.task?.cat?.category,
        productName: data.task?.cat?.name,
        descText: data.task?.descp?.text,
        descImage: data.task?.descp?.image,
      }
    : null;

  // State for edit modes
  const [editImage, setEditImage] = useState(false);
  const [editDownloadImage, setEditDownloadImage] = useState(false);
  const [editDownloadSampleImage, setEditDownloadSampleImage] = useState(false);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [loadingEmployeeTypes, setLoadingEmployeeTypes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Form state with updated depart as array (SINGLE ROLE for marketing)
  const [formData, setFormData] = useState({
    cat: "",
    sub: "",
    depart: [], // ✅ SINGLE role array for marketing
    name: "",
    type: "marketing", // ✅ FIXED: Marketing type
    estimatedDays: 1,
    templatePriority: "medium",
    descp: { text: "", image: null },
    email_descp: "",
    sms_descp: "",
    whatsapp_descp: "",
    checklists: [""],
    formChecklists: [{ name: "", downloadFormUrl: null, sampleFormUrl: null }],
  });

  // Fetch financial products and company names from Redux
  useEffect(() => {
    dispatch(fetchFinancialProduct());
    dispatch(fetchCompanyName());
  }, [dispatch]);

  // Fetch employee types/roles from API
  useEffect(() => {
    const fetchEmployeeTypes = async () => {
      setLoadingEmployeeTypes(true);
      try {
        const response = await axios.get("/api/employee/getEmployeeRoles");

        if (response.data && response.data.success) {
          setEmployeeTypes(response.data.data.roles || []);
        }
      } catch (error) {
        console.error("❌ Error fetching employee types:", error);
      } finally {
        setLoadingEmployeeTypes(false);
      }
    };

    fetchEmployeeTypes();
  }, []);

  // Get data from Redux store
  const products = useSelector(
    (state) => state.financialProduct.FinancialProducts || []
  );

  const company = useSelector((state) => state.CompanyName.CompanyNames || []);

  // Filter companies based on selected financial product
  const filteredCompanies = company.filter(
    (item) => item.financialProduct?._id === formData.cat
  );

  // Set form data when editing
  useEffect(() => {
    if (flat) {
      setFormData((prev) => ({
        ...prev,
        cat: flat?.cat?._id || "",
        sub: flat?.sub || "",
        depart: flat?.depart || [], // ✅ Now handling as array
        name: flat?.name || "",
        type: "marketing", // ✅ Always marketing
        estimatedDays: flat?.estimatedDays || 1,
        templatePriority: flat?.templatePriority || "medium",
        descp: {
          text: flat?.descp?.text || "",
          image: flat?.descp?.image || null,
        },
        email_descp: flat?.email_descp || "",
        sms_descp: flat?.sms_descp || "",
        whatsapp_descp: flat?.whatsapp_descp || "",
        checklists: flat?.checklists?.map((item) => item) || [""],
        formChecklists:
          flat?.formChecklists?.map((item) => ({
            name: item?.name || "",
            downloadFormUrl: item?.downloadFormUrl || null,
            sampleFormUrl: item?.sampleFormUrl || null,
          })) || [],
      }));
    }
  }, [data]);

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
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle errors
  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === "depart") {
      // ✅ Handle SINGLE selection for depart array (marketing)
      setFormData((prev) => ({ ...prev, [name]: [value] }));
    } else if (files) {
      if (name === "descpImage") {
        setFormData((prev) => ({
          ...prev,
          descp: { ...prev.descp, image: files[0] },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
      }
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle editor changes
  const handleEditorChange = (editor, data, field) => {
    if (field === "descp") {
      setFormData((prev) => ({
        ...prev,
        descp: { ...prev.descp, text: data },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: data }));
    }
  };

  // Checklist management functions
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

  // Form checklist management
  const updateFormChecklist = (index, field, value) => {
    const newFormChecklists = [...formData.formChecklists];
    if (value instanceof File) {
      newFormChecklists[index][field] = value;
    } else {
      newFormChecklists[index][field] = value;
    }
    setFormData((prev) => ({ ...prev, formChecklists: newFormChecklists }));
  };

  const addFormChecklist = () => {
    setFormData((prev) => ({
      ...prev,
      formChecklists: [
        ...prev.formChecklists,
        {
          name: "",
          downloadFormUrl: null,
          sampleFormUrl: null,
        },
      ],
    }));
  };

  const removeFormChecklist = (index) => {
    const newFormChecklists = [...formData.formChecklists];
    newFormChecklists.splice(index, 1);
    setFormData((prev) => ({ ...prev, formChecklists: newFormChecklists }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Validate required fields
      if (!formData.cat || !formData.name || !formData.depart[0]) {
        alert(
          "Please fill all required fields: Financial Product, Task Name, and Employee Role"
        );
        setLoading(false);
        return;
      }

      // Prepare form data
      const formDataToSend = new FormData();

      // Add all text fields
      formDataToSend.append("cat", formData.cat);
      formDataToSend.append("sub", formData.sub);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("type", "marketing"); // ✅ Marketing type
      formDataToSend.append("estimatedDays", formData.estimatedDays);
      formDataToSend.append("templatePriority", formData.templatePriority);
      formDataToSend.append("descpText", formData.descp.text || "");
      formDataToSend.append("email_descp", formData.email_descp);
      formDataToSend.append("sms_descp", formData.sms_descp);
      formDataToSend.append("whatsapp_descp", formData.whatsapp_descp);

      // ✅ Append depart as array (SINGLE role for marketing)
      formData.depart.forEach((role, index) => {
        formDataToSend.append(`depart[${index}]`, role);
      });

      // Add checklists as array
      formData.checklists.forEach((item, index) => {
        if (item.trim() !== "") {
          formDataToSend.append(`checklists[${index}]`, item);
        }
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
      formData.formChecklists.forEach((item, index) => {
        if (item.downloadFormUrl instanceof File) {
          formDataToSend.append(
            `downloadFormUrl_${index}`,
            item.downloadFormUrl
          );
        }
        if (item.sampleFormUrl instanceof File) {
          formDataToSend.append(`sampleFormUrl_${index}`, item.sampleFormUrl);
        }
      });

      let response;
      if (data) {
        // Update existing marketing task
        response = await axios.put(
          `/api/Task/marketing/${data._id}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        // Create new marketing task
        response = await axios.post("/api/Task", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        setSuccessMessage(response.data.message);

        // Reset form on success
        setFormData({
          cat: "",
          sub: "",
          depart: [],
          name: "",
          type: "marketing",
          estimatedDays: 1,
          templatePriority: "medium",
          descp: { text: "", image: null },
          email_descp: "",
          sms_descp: "",
          whatsapp_descp: "",
          checklists: [""],
          formChecklists: [
            { name: "", downloadFormUrl: null, sampleFormUrl: null },
          ],
        });

        // Call success callback
        setTimeout(() => {
          onSuccess?.();
          if (on) on("view");
        }, 1500);
      } else {
        setError(response.data.message || "Failed to save marketing task");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError(
        error.response?.data?.message || error.message || "Failed to save task"
      );
    } finally {
      setLoading(false);
    }
  };

  // Tab configuration
  const [activeTab, setActiveTab] = useState("tab_1");

  const tabConfig = [
    { id: "tab_1", label: "Work Description", icon: "📝" },
    { id: "tab_2", label: "Checklist", icon: "✅" },
    { id: "tab_6", label: "Download Forms", icon: "📄" },
    { id: "tab_3", label: "Email Templates", icon: "✉️" },
    { id: "tab_4", label: "SMS Templates", icon: "📱" },
    { id: "tab_5", label: "WhatsApp Templates", icon: "💬" },
  ];

  return (
    <div className="">
      <div className="card shadow-lg">
        <div className="card-header text-black">
          <h3 className="text-center card-title mt-4">
            <FaBullhorn className="me-2" />
            {data ? "Edit Marketing Task" : "Create Marketing Task Template"}
          </h3>
        </div>

        <form
          id="forming"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="card-body">
            <div className="row">
              {/* Financial Product - SAME AS COMPOSITE */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="font-weight-bold">Financial Product</label>
                  <select
                    name="cat"
                    className="form-control"
                    value={formData.cat}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose Financial Product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Company Name - SAME AS COMPOSITE */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="font-weight-bold">Company Name</label>
                  <select
                    name="sub"
                    className="form-control"
                    value={formData.sub}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose Company Name</option>
                    {filteredCompanies.map((comp) => (
                      <option key={comp._id} value={comp.companyName}>
                        {comp.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              {/* ✅ UPDATED: Employee Role (SINGLE SELECT for Marketing) */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="font-weight-bold">Employee Role *</label>
                  {loadingEmployeeTypes ? (
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm text-primary mr-2">
                        <span className="sr-only">Loading...</span>
                      </div>
                      <small>Loading employee roles...</small>
                    </div>
                  ) : (
                    <select
                      name="depart"
                      className="form-control"
                      value={formData.depart[0] || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Employee Role</option>
                      {employeeTypes.map((empType) => (
                        <option key={empType} value={empType}>
                          {empType}
                        </option>
                      ))}
                    </select>
                  )}
                  <small className="text-muted">
                    Marketing tasks can be assigned to single role only
                  </small>
                  {formData.depart.length > 0 && (
                    <div className="mt-2">
                      <small className="text-success">
                        Selected: {formData.depart.join(", ")}
                      </small>
                    </div>
                  )}
                </div>
              </div>

              {/* Task Name */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="font-weight-bold">Task Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter marketing task name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              {/* ✅ Estimated Days */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="font-weight-bold">Estimated Days *</label>
                  <input
                    type="number"
                    name="estimatedDays"
                    className="form-control"
                    min="1"
                    max="365"
                    value={formData.estimatedDays}
                    onChange={handleChange}
                    required
                  />
                  <small className="text-muted">
                    Estimated time to complete this task
                  </small>
                </div>
              </div>

              {/* ✅ Template Priority */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="font-weight-bold">Template Priority</label>
                  <select
                    name="templatePriority"
                    className="form-control"
                    value={formData.templatePriority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <small className="text-muted">
                    Default priority when task is assigned
                  </small>
                </div>
              </div>
            </div>

            {/* Hidden type field - ALWAYS MARKETING */}
            <input type="hidden" name="type" value="marketing" />

            {/* Tabs Navigation */}
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
                      }}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Tab Content - SAME AS COMPOSITE */}
              <div className="tab-content p-3 border border-top-0 rounded-bottom">
                {/* Tab 1: Work Description */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_1" ? "show active" : ""
                  }`}
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
                          data={formData.descp.text}
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
                              "imageUpload",
                              "undo",
                              "redo",
                            ],
                          }}
                        />
                      </div>
                      <div className="form-group mt-4">
                        {flat?.descImage && !editImage ? (
                          <div className="d-flex align-items-center">
                            <img
                              src={`/images/${flat.descImage}`}
                              alt="Uploaded"
                              className="img-thumbnail mr-3"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setEditImage(true)}
                              className="btn btn-dark btn-sm"
                            >
                              Change Image
                            </button>
                          </div>
                        ) : (
                          <>
                            <label>Attach Image</label>
                            <input
                              type="file"
                              name="descpImage"
                              className="form-control"
                              onChange={handleChange}
                              accept="image/*"
                            />
                            {editImage && (
                              <button
                                type="button"
                                onClick={() => setEditImage(false)}
                                className="btn btn-secondary btn-sm mt-2"
                              >
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab 2: Checklist */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_2" ? "show active" : ""
                  }`}
                >
                  <div className="card">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h4 className="card-title">Checklist Items</h4>
                      <button
                        type="button"
                        className="btn btn-dark btn-sm"
                        onClick={addChecklist}
                      >
                        <FaPlus className="mr-1" /> Add Item
                      </button>
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
                            {formData.checklists.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
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

                {/* Tab 3: Email Templates */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_3" ? "show active" : ""
                  }`}
                >
                  <div className="card">
                    <div className="card-header bg-light">
                      <h4 className="card-title">Email Template</h4>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label>Email Description</label>
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

                {/* Tab 4: SMS Templates */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_4" ? "show active" : ""
                  }`}
                >
                  <div className="card">
                    <div className="card-header bg-light">
                      <h4 className="card-title">SMS Template</h4>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label>SMS Description</label>
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

                {/* Tab 5: WhatsApp Templates */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_5" ? "show active" : ""
                  }`}
                >
                  <div className="card">
                    <div className="card-header bg-light">
                      <h4 className="card-title">WhatsApp Template</h4>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label>WhatsApp Description</label>
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

                {/* Tab 6: Download Forms */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab_6" ? "show active" : ""
                  }`}
                >
                  <div className="card">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h4 className="card-title mb-0">Form Checklists</h4>
                      <button
                        type="button"
                        className="btn btn-dark btn-sm"
                        onClick={addFormChecklist}
                      >
                        <FaPlus className="mr-1" /> Add Form
                      </button>
                    </div>
                    <div className="card-body">
                      {formData.formChecklists.map((item, index) => (
                        <div key={index} className="border rounded p-3 mb-3">
                          <div className="row g-3">
                            {/* Form Name */}
                            <div className="col-md-4">
                              <div className="form-group">
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
                                  placeholder="Enter form name"
                                />
                              </div>
                            </div>

                            {/* Blank Form */}
                            <div className="col-md-4">
                              <div className="form-group">
                                <label>Blank Form</label>
                                {item.downloadFormUrl && !editDownloadImage ? (
                                  <div className="d-flex align-items-center">
                                    <span className="text-success mr-2">
                                      ✓ File uploaded
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setEditDownloadImage(true)}
                                      className="btn btn-dark btn-sm"
                                    >
                                      Change
                                    </button>
                                  </div>
                                ) : (
                                  <>
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
                                    {editDownloadImage && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditDownloadImage(false)
                                        }
                                        className="btn btn-secondary btn-sm mt-2"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Sample Form */}
                            <div className="col-md-4">
                              <div className="form-group">
                                <label>Sample Form</label>
                                {item.sampleFormUrl &&
                                !editDownloadSampleImage ? (
                                  <div className="d-flex align-items-center">
                                    <span className="text-success mr-2">
                                      ✓ File uploaded
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditDownloadSampleImage(true)
                                      }
                                      className="btn btn-dark btn-sm"
                                    >
                                      Change
                                    </button>
                                  </div>
                                ) : (
                                  <>
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
                                    {editDownloadSampleImage && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditDownloadSampleImage(false)
                                        }
                                        className="btn btn-secondary btn-sm mt-2"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Remove Button */}
                            <div className="col-12 text-right">
                              {formData.formChecklists.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => removeFormChecklist(index)}
                                >
                                  <FaTrash className="mr-1" />
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="card-footer text-center">
            <button
              type="submit"
              className="btn btn-dark btn-lg px-5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2"></span>
                  Processing...
                </>
              ) : data ? (
                "Update Marketing Task"
              ) : (
                "Create Marketing Task Template"
              )}
            </button>
            {error && (
              <div className="alert alert-danger mt-3 mb-0">{error}</div>
            )}
            {successMessage && (
              <div className="alert alert-success mt-3 mb-0">
                {successMessage}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskMarketing;
