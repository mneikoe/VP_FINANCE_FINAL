import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  FaPlus,
  FaTrash,
  FaPaperclip,
  FaCheck,
  FaSpinner,
  FaCalendarAlt,
  FaExclamationCircle,
  FaUsers,
  FaEdit,
} from "react-icons/fa";
import {
  createCompositeTask,
  updateCompositeTask,
} from "../../../redux/feature/CompositeTask/CompositeThunx";
import {
  clearError,
  clearSuccessMessage,
} from "../../../redux/feature/CompositeTask/CompositeSlice";
import { fetchFinancialProduct } from "../../../redux/feature/FinancialProduct/FinancialThunx";
import { fetchCompanyName } from "../../../redux/feature/ComapnyName/CompanyThunx";
import axios from "axios";

const Addtask = ({ on, data, onSuccess }) => {
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

  const { loading, error, successMessage } = useSelector(
    (state) => state.compositeTask
  );

  // State for edit modes
  const [editImage, setEditImage] = useState(false);
  const [editDownloadImage, setEditDownloadImage] = useState(false);
  const [editDownloadSampleImage, setEditDownloadSampleImage] = useState(false);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [loadingEmployeeTypes, setLoadingEmployeeTypes] = useState(false);

  // Form state - depart is now a single value
  const [formData, setFormData] = useState({
    cat: "",
    sub: "",
    depart: "", // ✅ CHANGED: Now a single value for one employee role
    name: "",
    type: "composite",
    estimatedDays: 1,
    templatePriority: "medium",
    descp: { text: "", image: null },
    email_descp: "",
    sms_descp: "",
    whatsapp_descp: "",
    checklists: [""],
    formChecklists: [{ name: "", downloadFormUrl: null, sampleFormUrl: null }],
  });

  // Fetch financial products and company names
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
        console.error("Error fetching employee types:", error);
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
        depart: flat?.depart?.[0] || "", // ✅ Now taking first element if array exists
        name: flat?.name || "",
        type: flat?.type || "composite",
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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (files) {
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
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare form data
      const formDataToSend = new FormData();

      // Add all text fields
      formDataToSend.append("cat", formData.cat);
      formDataToSend.append("sub", formData.sub);
      formDataToSend.append("depart", formData.depart);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("estimatedDays", formData.estimatedDays);
      formDataToSend.append("templatePriority", formData.templatePriority);
      formDataToSend.append("descpText", formData.descp.text || "");
      formDataToSend.append("email_descp", formData.email_descp);
      formDataToSend.append("sms_descp", formData.sms_descp);
      formDataToSend.append("whatsapp_descp", formData.whatsapp_descp);

      // Add checklists as array
      formData.checklists.forEach((item, index) => {
        if (item.trim() !== "") {
          formDataToSend.append(`checklists[${index}]`, item);
        }
      });

      // Add formChecklists as JSON string
      formDataToSend.append(
        "formChecklists",
        JSON.stringify(
          formData.formChecklists.map((item) => ({
            name: item.name,
            downloadFormUrl:
              item.downloadFormUrl instanceof File
                ? item.downloadFormUrl.name
                : item.downloadFormUrl || "",
            sampleFormUrl:
              item.sampleFormUrl instanceof File
                ? item.sampleFormUrl.name
                : item.sampleFormUrl || "",
          }))
        )
      );

      // ✅ FIXED: Add image file with proper field name
      if (formData.descp.image instanceof File) {
        formDataToSend.append("image", formData.descp.image);
      } else if (formData.descp.image) {
        // If it's a string (existing image), still send it
        formDataToSend.append("existingImage", formData.descp.image);
      }

      // ✅ FIXED: Add form files with proper field names
      formData.formChecklists.forEach((item, index) => {
        if (item.downloadFormUrl instanceof File) {
          formDataToSend.append("downloadFormUrl", item.downloadFormUrl);
        }
        if (item.sampleFormUrl instanceof File) {
          formDataToSend.append("sampleFormUrl", item.sampleFormUrl);
        }
      });

      // Send to API
      if (data) {
        await dispatch(
          updateCompositeTask({
            id: data?.task?._id,
            formData: formDataToSend,
          })
        );
      } else {
        await dispatch(createCompositeTask(formDataToSend));
      }

      // Reset form on success
      if (!data) {
        setFormData({
          cat: "",
          sub: "",
          depart: "",
          name: "",
          type: "composite",
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
      }

      // Call success callback
      onSuccess?.();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to save task: " + error.message);
    }
  };

  // Tab configuration
  const [activeTab, setActiveTab] = useState("tab_1");

  const tabConfig = [
    { id: "tab_1", label: "Work Description", icon: "📝" },
    { id: "tab_2", label: "Checklist", icon: "✅" },
    { id: "tab_6", label: "Download Forms", icon: "📄" },
    { id: "tab_3", label: "Email", icon: "✉️" },
    { id: "tab_4", label: "SMS", icon: "📱" },
    { id: "tab_5", label: "WhatsApp", icon: "💬" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800">
              {data ? "Edit Composite Task" : "Create Composite Task"}
            </h1>
            <p className="text-gray-600 mt-1">
              {data
                ? "Update task details and configurations"
                : "Create new task template with all configurations"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="p-6"
          >
            {/* Basic Information */}
            <div className="bg-white rounded-lg p-5 mb-6 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Financial Product */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Financial Product *
                  </label>
                  <select
                    name="cat"
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.cat}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Financial Product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <select
                    name="sub"
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.sub}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Company Name</option>
                    {filteredCompanies.map((comp) => (
                      <option key={comp._id} value={comp.companyName}>
                        {comp.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee Type - Single Select Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Type *
                  </label>
                  {loadingEmployeeTypes ? (
                    <div className="flex items-center space-x-2 p-2.5 border border-gray-300 rounded-lg">
                      <FaSpinner className="animate-spin text-gray-400" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        name="depart"
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                        value={formData.depart}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Employee Type</option>
                        {employeeTypes.map((empType) => (
                          <option key={empType} value={empType}>
                            {empType}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Task Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter task name"
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Estimated Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Days *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <FaCalendarAlt className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      name="estimatedDays"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      min="1"
                      max="365"
                      value={formData.estimatedDays}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Template Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Priority
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["low", "medium", "high", "urgent"].map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            templatePriority: priority,
                          }))
                        }
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          formData.templatePriority === priority
                            ? priority === "urgent"
                              ? "bg-red-50 text-red-700 border border-red-300"
                              : priority === "high"
                              ? "bg-orange-50 text-orange-700 border border-orange-300"
                              : priority === "medium"
                              ? "bg-blue-50 text-blue-700 border border-blue-300"
                              : "bg-green-50 text-green-700 border border-green-300"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {tabConfig.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-5">
                {/* Tab 1: Work Description */}
                {activeTab === "tab_1" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-medium text-gray-800 mb-3">
                        Detailed Description
                      </h3>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                    </div>

                    <div>
                      <h3 className="text-base font-medium text-gray-800 mb-3">
                        Attach Image
                      </h3>
                      {flat?.descImage && !editImage ? (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <img
                            src={`/images/${flat.descImage}`}
                            alt="Uploaded"
                            className="w-16 h-16 object-cover rounded border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => setEditImage(true)}
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                          >
                            Change Image
                          </button>
                        </div>
                      ) : (
                        <div>
                          <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center">
                              <FaPaperclip className="w-6 h-6 mb-2 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                Click to upload image
                              </p>
                            </div>
                            <input
                              type="file"
                              name="descpImage"
                              className="hidden"
                              onChange={handleChange}
                              accept="image/*"
                            />
                          </label>
                          {editImage && (
                            <button
                              type="button"
                              onClick={() => setEditImage(false)}
                              className="mt-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: Checklist */}
                {activeTab === "tab_2" && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-medium text-gray-800">
                        Checklist Items
                      </h3>
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                        onClick={addChecklist}
                      >
                        <FaPlus className="w-3 h-3" />
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.checklists.map((checklist, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            placeholder={`Checklist item ${index + 1}`}
                            value={checklist}
                            onChange={(e) =>
                              updateChecklist(index, e.target.value)
                            }
                          />
                          {formData.checklists.length > 1 && (
                            <button
                              type="button"
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              onClick={() => removeChecklist(index)}
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Email Templates */}
                {activeTab === "tab_3" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-800">
                      Email Template
                    </h3>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                )}

                {/* Tab 4: SMS Templates */}
                {activeTab === "tab_4" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-800">
                      SMS Template
                    </h3>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                )}

                {/* Tab 5: WhatsApp Templates */}
                {activeTab === "tab_5" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-800">
                      WhatsApp Template
                    </h3>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                )}

                {/* Tab 6: Download Forms */}
                {activeTab === "tab_6" && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-medium text-gray-800">
                        Form Checklists
                      </h3>
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                        onClick={addFormChecklist}
                      >
                        <FaPlus className="w-3 h-3" />
                        Add Form
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.formChecklists.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-700 text-sm">
                              Form #{index + 1}
                            </h4>
                            {formData.formChecklists.length > 1 && (
                              <button
                                type="button"
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                onClick={() => removeFormChecklist(index)}
                              >
                                <FaTrash className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Form Name */}
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">
                                Form Name
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
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

                            {/* Blank Form */}
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">
                                Blank Form
                              </label>
                              {item.downloadFormUrl && !editDownloadImage ? (
                                <div className="space-y-2">
                                  <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700 text-xs">
                                    File uploaded
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setEditDownloadImage(true)}
                                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                  >
                                    Change File
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-300 rounded cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col items-center justify-center">
                                      <FaPaperclip className="w-5 h-5 mb-1 text-gray-400" />
                                      <p className="text-xs text-gray-500">
                                        Upload blank form
                                      </p>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        updateFormChecklist(
                                          index,
                                          "downloadFormUrl",
                                          file
                                        );
                                      }}
                                    />
                                  </label>
                                  {editDownloadImage && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditDownloadImage(false)
                                      }
                                      className="mt-2 w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Sample Form */}
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">
                                Sample Form
                              </label>
                              {item.sampleFormUrl &&
                              !editDownloadSampleImage ? (
                                <div className="space-y-2">
                                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs">
                                    File uploaded
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditDownloadSampleImage(true)
                                    }
                                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                  >
                                    Change File
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-300 rounded cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col items-center justify-center">
                                      <FaPaperclip className="w-5 h-5 mb-1 text-gray-400" />
                                      <p className="text-xs text-gray-500">
                                        Upload sample form
                                      </p>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        updateFormChecklist(
                                          index,
                                          "sampleFormUrl",
                                          file
                                        );
                                      }}
                                    />
                                  </label>
                                  {editDownloadSampleImage && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditDownloadSampleImage(false)
                                      }
                                      className="mt-2 w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Section */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                <div className="flex-1">
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200 text-sm">
                      <FaExclamationCircle />
                      <span>{error}</span>
                    </div>
                  )}
                  {successMessage && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded border border-green-200 text-sm">
                      <FaCheck />
                      <span className="font-medium">{successMessage}</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : data ? (
                    <>
                      <FaCheck />
                      Update Task
                    </>
                  ) : (
                    "Create Task Template"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Addtask;
