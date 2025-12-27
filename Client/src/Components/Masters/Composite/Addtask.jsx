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

  // Form state with updated depart as array
  const [formData, setFormData] = useState({
    cat: "",
    sub: "",
    depart: [], // ✅ CHANGED: Now an array for multiple roles
    name: "",
    type: "composite",
    estimatedDays: 1, // ✅ NEW FIELD
    templatePriority: "medium", // ✅ NEW FIELD
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
    const { name, value, type, files, options } = e.target;

    if (name === "depart") {
      // ✅ Handle multiple selection for depart array
      const selectedOptions = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setFormData((prev) => ({ ...prev, [name]: selectedOptions }));
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

    try {
      // Prepare form data
      const formDataToSend = new FormData();

      // Add all text fields
      formDataToSend.append("cat", formData.cat);
      formDataToSend.append("sub", formData.sub);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("estimatedDays", formData.estimatedDays);
      formDataToSend.append("templatePriority", formData.templatePriority);
      formDataToSend.append("descpText", formData.descp.text || "");
      formDataToSend.append("email_descp", formData.email_descp);
      formDataToSend.append("sms_descp", formData.sms_descp);
      formDataToSend.append("whatsapp_descp", formData.whatsapp_descp);

      // ✅ Append depart as array
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
      setFormData({
        cat: "",
        sub: "",
        depart: [],
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
    { id: "tab_3", label: "Email Templates", icon: "✉️" },
    { id: "tab_4", label: "SMS Templates", icon: "📱" },
    { id: "tab_5", label: "WhatsApp Templates", icon: "💬" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {data ? "Edit Composite Task" : "Create Composite Task"}
                </h1>
                <p className="text-blue-100 mt-2">
                  {data
                    ? "Update task details and configurations"
                    : "Create new task template with all configurations"}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                  {formData.type.toUpperCase()} TASK
                </span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="p-6 md:p-8"
          >
            {/* Basic Information Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Financial Product */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Financial Product <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="cat"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none hover:border-gray-400"
                      value={formData.cat}
                      onChange={handleChange}
                      required
                    >
                      <option value="" className="text-gray-400">
                        Choose Financial Product
                      </option>
                      {products.map((product) => (
                        <option
                          key={product._id}
                          value={product._id}
                          className="text-gray-700"
                        >
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg
                        className="w-5 h-5"
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
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="sub"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none hover:border-gray-400"
                      value={formData.sub}
                      onChange={handleChange}
                      required
                    >
                      <option value="" className="text-gray-400">
                        Choose Company Name
                      </option>
                      {filteredCompanies.map((comp) => (
                        <option
                          key={comp._id}
                          value={comp.companyName}
                          className="text-gray-700"
                        >
                          {comp.companyName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg
                        className="w-5 h-5"
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
                </div>

                {/* Employee Types */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Employee Types <span className="text-red-500">*</span>
                  </label>
                  {loadingEmployeeTypes ? (
                    <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-xl">
                      <FaSpinner className="animate-spin text-blue-600" />
                      <span className="text-gray-600">
                        Loading employee types...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <select
                        name="depart"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                        multiple
                        value={formData.depart}
                        onChange={handleChange}
                        required
                        size="3"
                      >
                        {employeeTypes.map((empType) => (
                          <option
                            key={empType}
                            value={empType}
                            className="px-3 py-2 hover:bg-blue-50"
                          >
                            {empType}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaUsers className="mr-2" />
                        Hold Ctrl/Cmd to select multiple roles
                      </div>
                      {formData.depart.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          {formData.depart.map((role, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1"
                            >
                              {role}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    depart: prev.depart.filter(
                                      (r) => r !== role
                                    ),
                                  }));
                                }}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Task Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter task name"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 hover:border-gray-400"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Estimated Days */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Estimated Days <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <FaCalendarAlt />
                    </div>
                    <input
                      type="number"
                      name="estimatedDays"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                      min="1"
                      max="365"
                      value={formData.estimatedDays}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated time to complete this task
                  </p>
                </div>

                {/* Template Priority */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          formData.templatePriority === priority
                            ? priority === "urgent"
                              ? "bg-red-100 text-red-700 border-2 border-red-300"
                              : priority === "high"
                              ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                              : priority === "medium"
                              ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                              : "bg-green-100 text-green-700 border-2 border-green-300"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Default priority when task is assigned
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {tabConfig.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Tab 1: Work Description */}
                {activeTab === "tab_1" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Detailed Description
                      </h3>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
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

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Attach Image
                      </h3>
                      {flat?.descImage && !editImage ? (
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <img
                            src={`/images/${flat.descImage}`}
                            alt="Uploaded"
                            className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">
                              Current image attached
                            </p>
                            <button
                              type="button"
                              onClick={() => setEditImage(true)}
                              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                            >
                              <FaEdit />
                              Change Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FaPaperclip className="w-8 h-8 mb-2 text-gray-400" />
                                <p className="text-sm text-gray-500">
                                  Click to upload image
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  PNG, JPG, GIF up to 10MB
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
                          </div>
                          {editImage && (
                            <button
                              type="button"
                              onClick={() => setEditImage(false)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
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
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Checklist Items
                      </h3>
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                        onClick={addChecklist}
                      >
                        <FaPlus />
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.checklists.map((checklist, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-medium">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder={`Checklist item ${index + 1}`}
                            value={checklist}
                            onChange={(e) =>
                              updateChecklist(index, e.target.value)
                            }
                          />
                          {formData.checklists.length > 1 && (
                            <button
                              type="button"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              onClick={() => removeChecklist(index)}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Email Templates */}
                {activeTab === "tab_3" && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Email Template
                    </h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
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
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-lg font-semibold text-gray-800">
                      SMS Template
                    </h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
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
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-lg font-semibold text-gray-800">
                      WhatsApp Template
                    </h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
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
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Form Checklists
                      </h3>
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                        onClick={addFormChecklist}
                      >
                        <FaPlus />
                        Add Form
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.formChecklists.map((item, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-800">
                              Form #{index + 1}
                            </h4>
                            {formData.formChecklists.length > 1 && (
                              <button
                                type="button"
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                onClick={() => removeFormChecklist(index)}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Form Name */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Form Name
                              </label>
                              <input
                                type="text"
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Blank Form
                              </label>
                              {item.downloadFormUrl && !editDownloadImage ? (
                                <div className="space-y-3">
                                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700">
                                      <FaCheck className="text-green-500" />
                                      <span className="font-medium">
                                        File uploaded
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setEditDownloadImage(true)}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full"
                                  >
                                    Change File
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <FaPaperclip className="w-6 h-6 mb-2 text-gray-400" />
                                      <p className="text-sm text-gray-500">
                                        Upload blank form
                                      </p>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) =>
                                        updateFormChecklist(
                                          index,
                                          "downloadFormUrl",
                                          e.target.files[0]
                                        )
                                      }
                                    />
                                  </label>
                                  {editDownloadImage && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditDownloadImage(false)
                                      }
                                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Sample Form */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Sample Form
                              </label>
                              {item.sampleFormUrl &&
                              !editDownloadSampleImage ? (
                                <div className="space-y-3">
                                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-700">
                                      <FaCheck className="text-blue-500" />
                                      <span className="font-medium">
                                        File uploaded
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditDownloadSampleImage(true)
                                    }
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full"
                                  >
                                    Change File
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <FaPaperclip className="w-6 h-6 mb-2 text-gray-400" />
                                      <p className="text-sm text-gray-500">
                                        Upload sample form
                                      </p>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) =>
                                        updateFormChecklist(
                                          index,
                                          "sampleFormUrl",
                                          e.target.files[0]
                                        )
                                      }
                                    />
                                  </label>
                                  {editDownloadSampleImage && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditDownloadSampleImage(false)
                                      }
                                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full"
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
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex-1">
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                      <FaExclamationCircle />
                      <span>{error}</span>
                    </div>
                  )}
                  {successMessage && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-200 animate-pulse">
                      <FaCheck />
                      <span className="font-medium">{successMessage}</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2"
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

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Addtask;
