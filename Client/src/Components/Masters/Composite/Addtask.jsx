

// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import { FaPlus, FaTrash, FaPaperclip, FaCheck } from "react-icons/fa";
// import {
//   createCompositeTask,
//   updateCompositeTask,
// } from "../../../redux/feature/CompositeTask/CompositeThunx";
// import {
//   clearError,
//   clearSuccessMessage,
// } from "../../../redux/feature/CompositeTask/CompositeSlice";
// import { fetchFinancialProduct } from "../../../redux/feature/FinancialProduct/FinancialThunx";
// import { fetchCompanyName } from "../../../redux/feature/ComapnyName/CompanyThunx";

// const Addtask = ({ on, data }) => {
//   const dispatch = useDispatch();

//   const flat = {
//     ...data?.task,
//     category: data?.task?.cat?.category,
//     productName: data?.task?.cat?.name,
//     descText: data?.task?.descp?.text,
//     descImage: data?.task?.descp?.image,
//   };

//   const { loading, error, successMessage } = useSelector(
//     (state) => state.compositeTask
//   );

//   console.log(data);
//   const [editImage, setEditImage] = useState(false);
//   const [editDownloadImage, SetEditDownloadImage] = useState(false);
//   const [editDownloadSampleImage, SetEditDownloadSampleImage] = useState(false);

//   const [formData, setFormData] = useState({
//     cat: "",
//     sub: "",
//     depart: "",
//     name: "",
//     type: "composite",
//     descp: { text: "", image: null },
//     email_descp: "",
//     sms_descp: "",
//     whatsapp_descp: "",
//     checklists: [""],
//     formChecklists: [{ name: "", downloadFormUrl: null, sampleFormUrl: null }],
//   });

//   // fetch financialProduct
//   useEffect(() => {
//     dispatch(fetchFinancialProduct());
//     dispatch(fetchCompanyName());
//   }, [dispatch]);

//   // financial Product
//   const products = useSelector(
//     (state) => state.financialProduct.FinancialProducts || []
//   );
//   console.log(products);

//   // company name
//   const company = useSelector((state) => state.CompanyName.CompanyNames || []);
//   console.log(company);

//   // filter company name according to financial productconst filteredCompanies = company.filter(
//   const filteredCompanies = company.filter(
//     (item) => item.financialProduct?._id === formData.cat
//   );

//   useEffect(() => {
//     if (data) {
//       // setFormData(data);
//     }
//   }, [data]);

//   const [activeTab, setActiveTab] = useState("tab_1");
//   const [submitSuccess, setSubmitSuccess] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Clear messages when component unmounts
//   useEffect(() => {
//     return () => {
//       dispatch(clearError());
//       dispatch(clearSuccessMessage());
//     };
//   }, [dispatch]);

//   // Handle success message
//   useEffect(() => {
//     if (successMessage) {
//       setSubmitSuccess(true);
//       const timer = setTimeout(() => {
//         setSubmitSuccess(false);
//         dispatch(clearSuccessMessage());
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [successMessage, dispatch]);

//   // Handle errors
//   useEffect(() => {
//     if (error) {
//       alert(error);
//       dispatch(clearError());
//     }
//   }, [error, dispatch]);


  

//   useEffect(() => {
//     if (data) {
//       setFormData((prev) => ({
//         ...prev,
//         cat: flat?.cat?._id,
//         sub: flat?.sub,
//         depart: flat?.depart,
//         name: flat?.name,
//         type: flat?.type,
//         descp: { text: flat?.descp?.text, image: flat?.descp?.image },
//         email_descp: flat?.email_descp,
//         sms_descp: flat?.sms_descp,
//         whatsapp_descp: flat?.whatsapp_descp,
//         checklists: [flat?.checklists?.map((item) => item)],
//         formChecklists:
//           flat?.formChecklists?.map((item) => ({
//             name: item?.name,
//             downloadFormUrl: item?.downloadFormUrl,
//             sampleFormUrl: item?.sampleFormUrl,
//           })) || [],
//       }));
//     }
//   }, [data]);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (files) {
//       if (name === "descpImage") {
//         setFormData((prev) => ({
//           ...prev,
//           descp: { ...prev.descp, image: files[0] },
//         }));
//       } else {
//         setFormData((prev) => ({ ...prev, [name]: files[0] }));
//       }
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleEditorChange = (editor, data, field) => {
//     if (field === "descp") {
//       // For description, we need to preserve the image property
//       setFormData((prev) => ({
//         ...prev,
//         descp: { ...prev.descp, text: data },
//       }));
//     } else {
//       // For other editors (email, sms, whatsapp)
//       setFormData((prev) => ({ ...prev, [field]: data }));
//     }
//   };
//   // checklist
//   const addChecklist = () => {
//     setFormData((prev) => ({
//       ...prev,
//       checklists: [...prev.checklists, ""],
//     }));
//   };

//   const updateChecklist = (index, value) => {
//     const newChecklists = [...formData.checklists];
//     newChecklists[index] = value;
//     setFormData((prev) => ({ ...prev, checklists: newChecklists }));
//   };

//   const removeChecklist = (index) => {
//     const newChecklists = [...formData.checklists];
//     newChecklists.splice(index, 1);
//     setFormData((prev) => ({ ...prev, checklists: newChecklists }));
//   };

//   // For form checklist files
//   const updateFormChecklist = (index, field, value) => {
//     const newFormChecklists = [...formData.formChecklists];
//     if (value instanceof File) {
//       newFormChecklists[index][field] = value;
//     } else {
//       newFormChecklists[index][field] = value;
//     }
//     setFormData((prev) => ({ ...prev, formChecklists: newFormChecklists }));
//   };

//   const addFormChecklist = () => {
//     setFormData((prev) => ({
//       ...prev,
//       formChecklists: [...prev.formChecklists, { name: "", file: null }],
//     }));
//   };

//   const removeFormChecklist = (index) => {
//     const newFormChecklists = [...formData.formChecklists];
//     newFormChecklists.splice(index, 1);
//     setFormData((prev) => ({ ...prev, formChecklists: newFormChecklists }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       console.log(filteredCompanies);
//       // Prepare form data
//       const formDataToSend = new FormData();

//       // Add all text fields
//       formDataToSend.append("cat", formData.cat);
//       formDataToSend.append("sub", formData.sub);
//       formDataToSend.append("depart", formData.depart);
//       formDataToSend.append("name", formData.name);
//       formDataToSend.append("type", formData.type);
//       // formDataToSend.append("descpText", formData.descp.text);
//       formDataToSend.append("descpText", formData.descp.text || "");
//       formDataToSend.append("email_descp", formData.email_descp);
//       formDataToSend.append("sms_descp", formData.sms_descp);
//       formDataToSend.append("whatsapp_descp", formData.whatsapp_descp);

//       // Add checklists as array
//       formData.checklists.forEach((item, index) => {
//         formDataToSend.append(`checklists[${index}]`, item);
//       });

//       // Add formChecklists as JSON string
//       formDataToSend.append(
//         "formChecklists",
//         JSON.stringify(formData.formChecklists)
//       );

//       // Add files if they exist
//       if (formData.descp.image) {
//         formDataToSend.append("image", formData.descp.image);
//       }

//       // Add form files
//       formData.formChecklists.forEach((item) => {
//         if (item.downloadFormUrl instanceof File) {
//           formDataToSend.append("downloadFormUrl", item.downloadFormUrl);
//         }
//         if (item.sampleFormUrl instanceof File) {
//           formDataToSend.append("sampleFormUrl", item.sampleFormUrl);
//         }
//       });

//       if (data) {
//         console.log(formData);
//         console.log(data?.task?._id);
        
//         await dispatch(
//           updateCompositeTask({ id: data?.task?._id, formData: formDataToSend })
//         );
//       } else {
//         await dispatch(createCompositeTask(formDataToSend));
//       }

//       // Reset form
//       setFormData({
//         cat: "",
//         sub: "",
//         depart: "",
//         name: "",
//         type: "marketing",
//         descp: { text: "", image: null },
//         email_descp: "",
//         sms_descp: "",
//         whatsapp_descp: "",
//         checklists: [""],
//         formChecklists: [
//           { name: "", downloadFormUrl: null, sampleFormUrl: null },
//         ],
//       });

//       // Switch to view mode
//       on("view");

//       setSubmitSuccess(true);
//       setTimeout(() => setSubmitSuccess(false), 3000);
//     } catch (error) {
//       console.error("Submission error:", error);
//       alert("Failed to save task: " + error.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const tabConfig = [
//     { id: "tab_1", label: "Work Description", icon: "📝" },
//     { id: "tab_2", label: "Checklist", icon: "✅" },
//     { id: "tab_6", label: "Download Forms", icon: "📄" },
//     { id: "tab_3", label: "Email Templates", icon: "✉️" },
//     { id: "tab_4", label: "SMS Templates", icon: "📱" },
//     { id: "tab_5", label: "WhatsApp Templates", icon: "💬" },
//   ];
//   // { id: "tab_7", label: "Sample Form", icon: "📋" },

//   console.log(flat);

//   return (
//     <div className="">
//       <div className="card shadow-lg">
//         <div className="card-header  text-black">
//           <h3 className="text-center card-title mt-4">Composite Task Form</h3>
//           <div className="card-tools">
//             <button
//               type="button"
//               className="btn btn-tool"
//               data-card-widget="collapse"
//             >
//               <i className="fas fa-minus"></i>
//             </button>
//           </div>
//         </div>

//         <form
//           id="forming"
//           onSubmit={handleSubmit}
//           encType="multipart/form-data"
//         >
//           <div className="card-body">
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="form-group">
//                   <label className="font-weight-bold">Financial Product</label>

//                   <select
//                     name="cat"
//                     className="form-control select2"
//                     onChange={handleChange}
//                     // value={formData.cat || flat?.cat?._id}
//                     value={formData.cat}
//                   >
//                     <option value="">Choose Financial Product</option>
//                     {Array.isArray(products) &&
//                       products.map((product) => (
//                         <option key={product._id} value={product._id}>
//                           {product.name}
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="col-md-6">
//                 <div className="form-group">
//                   <label className="font-weight-bold">Company Name</label>
//                   <select
//                     name="sub"
//                     className="form-control select2"
//                     value={formData.sub }
//                     onChange={handleChange}
//                   >
//                     <option value="">Choose Company Name</option>
//                     {company.map((comp) => (
//                       <option key={comp._id} value={comp.companyName}>
//                         {comp.companyName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className="row ">
//               <div className="col-md-6">
//                 <div className="form-group">
//                   <label className="font-weight-bold">Employee Type</label>
//                   <select
//                     name="depart"
//                     className="form-control select2"
//                     value={formData.depart}
//                     onChange={handleChange}
//                   >
//                     <option value="">Choose Employee</option>
//                     <option value="OA">OA</option>
//                     <option value="OE">OE</option>
//                     <option value="CRE">CRE</option>
//                     <option value="Telemarketer">Telemarketer</option>
//                     <option value="Telecaller">Telecaller</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="col-md-6">
//                 <div className="form-group">
//                   <label className="font-weight-bold">Task Name</label>
//                   <input
//                     type="text"
//                     name="name"
//                     placeholder="Enter task name"
//                     className="form-control"
//                     value={formData.name}
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>
//             </div>

//             <input type="hidden" name="type" value="composite" />

//             <div className="nav-tabs-custom mt-4">
//               <ul className="nav nav-pills nav-fill mb-4">
//                 {tabConfig.map((tab) => (
//                   <li key={tab.id} className="nav-item">
//                     <button
//                       type="button"
//                       className={`nav-link ${
//                         activeTab === tab.id ? "active" : ""
//                       }`}
//                       onClick={() => setActiveTab(tab.id)}
//                       style={{
//                         backgroundColor: activeTab === tab.id ? "#2B3A4A" : "",
//                         color: activeTab === tab.id ? "#fff" : "black",
//                         transition: "0.3s ease",
//                       }}
//                     >
//                       <span className="mr-2">{tab.icon}</span>
//                       {tab.label}
//                     </button>
//                   </li>
//                 ))}
//               </ul>

//               <div className="tab-content p-3 border border-top-0 rounded-bottom">
//                 {/* Work Description Tab */}
//                 <div
//                   className={`tab-pane fade ${
//                     activeTab === "tab_1" ? "show active" : ""
//                   }`}
//                   id="tab_1"
//                 >
//                   <div className="card">
//                     <div className="card-header bg-light">
//                       <h4 className="card-title">Work Description</h4>
//                     </div>
//                     <div className="card-body">
//                       <div className="form-group">
//                         <label>Detailed Description</label>
//                         <CKEditor
//                           editor={ClassicEditor}
//                           data={formData?.descp?.text } // Fallback to empty string
//                           onChange={(event, editor) =>
//                             handleEditorChange(
//                               editor,
//                               editor.getData(),
//                               "descp"
//                             )
//                           }
//                           config={{
//                             toolbar: [
//                               "heading",
//                               "|",
//                               "bold",
//                               "italic",
//                               "link",
//                               "bulletedList",
//                               "numberedList",
//                               "blockQuote",
//                               "imageUpload", // Add this
//                               "undo",
//                               "redo",
//                             ],
//                           }}
//                         />
//                         <div className="form-group mt-4">
                            
//                           {flat?._id && !editImage ? (
                        
//                             <div className="flex justify-center items-center p-4">

                            
//                               <img
//                                 src={`/images/${flat.descImage}`}//                                 alt="Uploaded"
//                                 className=" w-[100px] max-w-sm rounded-xl shadow-md object-cover"
//                               />
//                               <button
//                                 onClick={() => setEditImage(true)}
//                                 className="px-4 py-1 border-2 rounded   m-2 bg-black text-white"
//                               >
//                                 Edit
//                               </button>
//                             </div>
//                           ) : (
//                             <>
//                               {console.log(!flat && !editImage  ) }
//                               <label>Attach File</label>
//                               <div className="custom-file flex gap-2">
//                                 <input
//                                   type="file"
//                                   name="descpImage"
//                                   className="bg-gray-300 px-3 py-1 rounded custom-file-input"
//                                   id="customFile"
//                                   onChange={handleChange}
//                                 />
//                                 <label
//                                   className=" bg-red-500 custom-file-label"
//                                   htmlFor="customFile"
//                                 ></label>
//                                 <button
//                                   onClick={() => setEditImage(false)}
//                                   className="bg-red-900 text-white border rounded px-4 py-1"
//                                 >
//                                   Cancel
//                                 </button>
//                               </div>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Checklist Template Tab */}
//                 <div
//                   className={`tab-pane fade ${
//                     activeTab === "tab_2" ? "show active" : ""
//                   }`}
//                   id="tab_2"
//                 >
//                   <div className="card">
//                     <div className="card-header bg-light">
//                       <div className="d-flex justify-content-between align-items-center">
//                         <h4 className="card-title">Checklist Items</h4>
//                         <button
//                           style={{ backgroundColor: "#2B3A4A", color: "white" }}
//                           type="button"
//                           className="btn btn-sm "
//                           onClick={addChecklist}
//                         >
//                           <FaPlus className="mr-1" /> Add Item
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       {formData?.checklists?.map((checklist, index) => (
//                         <div
//                           key={index}
//                           className="form-group row align-items-center mb-3"
//                         >
//                           <div className="col-sm-10">
//                             <div className="input-group">
//                               <div className="input-group-prepend">
//                                 <span className="input-group-text">
//                                   {index + 1}
//                                 </span>
//                               </div>
//                               <input
//                                 type="text"
//                                 className="form-control"
//                                 placeholder={`Checklist item ${index + 1}`}
//                                 value={checklist}
//                                 onChange={(e) =>
//                                   updateChecklist(index, e.target.value)
//                                 }
//                               />
//                             </div>
//                           </div>
//                           <div className="col-sm-2">
//                             {index > 0 && (
//                               <button
//                                 type="button"
//                                 className="btn btn-sm btn-danger"
//                                 onClick={() => removeChecklist(index)}
//                               >
//                                 <FaTrash />
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Email Templates Tab */}
//                 <div
//                   className={`tab-pane fade ${
//                     activeTab === "tab_3" ? "show active" : ""
//                   }`}
//                   id="tab_3"
//                 >
//                   <div className="card">
//                     <div className="card-header bg-light">
//                       <h4 className="card-title">Email Template</h4>
//                     </div>
//                     <div className="card-body">
//                       <div className="form-group">
//                         <label>Email Content</label>
//                         <CKEditor
//                           editor={ClassicEditor}
//                           data={formData?.email_descp }
//                           onChange={(event, editor) =>
//                             handleEditorChange(
//                               editor,
//                               editor.getData(),
//                               "email_descp"
//                             )
//                           }
//                           config={{
//                             toolbar: [
//                               "heading",
//                               "|",
//                               "bold",
//                               "italic",
//                               "link",
//                               "bulletedList",
//                               "numberedList",
//                               "blockQuote",
//                               "undo",
//                               "redo",
//                             ],
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Message Templates Tab */}
//                 <div
//                   className={`tab-pane fade ${
//                     activeTab === "tab_4" ? "show active" : ""
//                   }`}
//                   id="tab_4"
//                 >
//                   <div className="card">
//                     <div className="card-header bg-light">
//                       <h4 className="card-title">SMS Template</h4>
//                     </div>
//                     <div className="card-body">
//                       <div className="form-group">
//                         <label>SMS Content</label>
//                         <CKEditor
//                           editor={ClassicEditor}
//                           data={formData?.sms_descp }
//                           onChange={(event, editor) =>
//                             handleEditorChange(
//                               editor,
//                               editor.getData(),
//                               "sms_descp"
//                             )
//                           }
//                           config={{
//                             toolbar: ["bold", "italic", "|", "undo", "redo"],
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Whatsapp Templates Tab */}
//                 <div
//                   className={`tab-pane fade ${
//                     activeTab === "tab_5" ? "show active" : ""
//                   }`}
//                   id="tab_5"
//                 >
//                   <div className="card">
//                     <div className="card-header bg-light">
//                       <h4 className="card-title">WhatsApp Template</h4>
//                     </div>
//                     <div className="card-body">
//                       <div className="form-group">
//                         <label>WhatsApp Message</label>
//                         <CKEditor
//                           editor={ClassicEditor}
//                           data={formData?.whatsapp_descp }
//                           onChange={(event, editor) =>
//                             handleEditorChange(
//                               editor,
//                               editor.getData(),
//                               "whatsapp_descp"
//                             )
//                           }
//                           config={{
//                             toolbar: ["bold", "italic", "|", "undo", "redo"],
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Download Forms Tab */}
//                 <div
//                   className={`tab-pane fade ${
//                     activeTab === "tab_6" ? "show active" : ""
//                   }`}
//                   id="tab_6"
//                 >
//                   <div className="card">
//                     <div className="card-header bg-light d-flex justify-content-between align-items-center">
//                       <h4 className="card-title mb-0">Form Checklists</h4>
//                       <button
//                         type="button"
//                         className="btn btn-sm"
//                         style={{ backgroundColor: "#2B3A4A", color: "white" }}
//                         onClick={addFormChecklist}
//                       >
//                         <FaPlus className="mr-1" /> Add Form
//                       </button>
//                     </div>
//                     <div className="card-body">
//                       {formData?.formChecklists?.map((item, index) => (
//                         <div
//                           key={index}
//                           className="border rounded p-3 mb-3 d-flex g-4 justify-content-between w-100"
//                         >
//                           <div className="form-group ">
//                             <label>Form Name</label>
//                             <input
//                               type="text"
//                               className="form-control"
//                               value={
//                                  item.name
//                               }
//                               onChange={(e) =>
//                                 updateFormChecklist(
//                                   index,
//                                   "name",
//                                   e.target.value
//                                 )
//                               }
//                               placeholder={`Form name ${index + 1}`}
//                             />
//                           </div>

//                           {flat && !editDownloadImage ? (
//                             flat?.formChecklists?.map((imgs, index) => (
//                               <div
//                                 key={index}
//                                 className=" w-[5  0px] h-[20px] flex justify-center items-center p-4"
//                               >
//                                 <img
//                                   src={`/images/${imgs.downloadFormUrl}`}//                                   alt="Uploaded"
//                                   className=" w-[50px]  max-w-sm rounded-xl shadow-md object-cover"
//                                 />
//                                 <button
//                                   onClick={() => SetEditDownloadImage(true)}
//                                   className="px-4 py-1 border-2 rounded   m-2 bg-black text-white"
//                                 >
//                                   Edit
//                                 </button>
//                               </div>
//                             ))
//                           ) : (
//                             <div className="form-group">
//                               <label>Blank Form</label>
//                               <input
//                                 type="file"
//                                 className="form-control"
//                                 onChange={(e) =>
//                                   updateFormChecklist(
//                                     index,
//                                     "downloadFormUrl",
//                                     e.target.files[0]
//                                   )
//                                 }
//                               />
//                               {item.downloadFormUrl &&
//                                 typeof item.downloadFormUrl === "string" && (
//                                   <small className="text-success">
//                                     Existing file: {item.downloadFormUrl}
//                                   </small>
//                                 )}

//                               <button
//                                 onClick={() =>
//                                   SetEditDownloadImage(!editDownloadImage)
//                                 }
//                                 className="bg-red-900 px-4 py-1 text-white 
//                                 flex mt-2 rounded"
//                               >
//                                 Cancel
//                               </button>
//                             </div>
//                           )}

//                           {flat && !editDownloadSampleImage ? (
//                             flat?.formChecklists?.map((imgs, index) => (
//                               <div
//                                 key={index}
//                                 className=" w-[5  0px] h-[20px] flex justify-center items-center p-4"
//                               >
//                                 <img
//                                   src={`/images/${imgs.sampleFormUrl}`}//                                   alt="Uploaded"
//                                   className=" w-[50px]  max-w-sm rounded-xl shadow-md object-cover"
//                                 />
//                                 <button
//                                   onClick={() =>
//                                     SetEditDownloadSampleImage(true)
//                                   }
//                                   className="px-4 py-1 border-2 rounded   m-2 bg-black text-white"
//                                 >
//                                   Edit
//                                 </button>
//                               </div>
//                             ))
//                           ) : (
//                             <div className="form-group">
//                               <label>Sample Form</label>
//                               <input
//                                 type="file"
//                                 className="form-control"
//                                 onChange={(e) =>
//                                   updateFormChecklist(
//                                     index,
//                                     "sampleFormUrl",
//                                     e.target.files[0]
//                                   )
//                                 }
//                               />
//                               {item.sampleFormUrl &&
//                                 typeof item.sampleFormUrl === "string" && (
//                                   <small className="text-success">
//                                     Existing file: {item.sampleFormUrl}
//                                   </small>
//                                 )}

//                               <button
//                                 onClick={() =>
//                                   SetEditDownloadSampleImage(
//                                     !editDownloadSampleImage
//                                   )
//                                 }
//                                 className="bg-red-900 px-4 py-1 text-white 
//                                 flex mt-2 rounded"
//                               >
//                                 Cancel
//                               </button>
//                             </div>
//                           )}

//                           <div className="text-right">
//                             {index > 0 && (
//                               <button
//                                 type="button"
//                                 className="btn btn-danger btn-sm mt-4"
//                                 onClick={() => removeFormChecklist(index)}
//                               >
//                                 <FaTrash className="mr-1" />
//                                 Remove
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="card-footer text-center">
//             <button
//               style={{ backgroundColor: "#2B3A4A", color: "white" }}
//               type="submit"
//               className="btn btn-lg px-5"
//               disabled={loading} // from Redux state
//             >
//               {loading ? (
//                 <>
//                   <span
//                     className="spinner-border spinner-border-sm mr-2"
//                     role="status"
//                     aria-hidden="true"
//                   ></span>
//                   Processing...
//                 </>
//               ) : submitSuccess ? (
//                 <>
//                   <FaCheck className="mr-2" />{" "}
//                   {data ? "Updated Successfully!" : "Submitted Successfully!"}
//                 </>
//               ) : (
//                 <>{data ? "Update" : "Submit"}</>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Addtask;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { FaPlus, FaTrash, FaPaperclip, FaCheck } from "react-icons/fa";
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

const Addtask = ({ on, data, onSuccess }) => {
  const dispatch = useDispatch();

  const flat = {
    ...data?.task,
    category: data?.task?.cat?.category,
    productName: data?.task?.cat?.name,
    descText: data?.task?.descp?.text,
    descImage: data?.task?.descp?.image,
  };

  const { loading, error, successMessage } = useSelector(
    (state) => state.compositeTask
  );

  console.log(data);
  const [editImage, setEditImage] = useState(false);
  const [editDownloadImage, SetEditDownloadImage] = useState(false);
  const [editDownloadSampleImage, SetEditDownloadSampleImage] = useState(false);

  const [formData, setFormData] = useState({
    cat: "",
    sub: "",
    depart: "",
    name: "",
    type: "composite",
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
  console.log(products);

  // company name
  const company = useSelector((state) => state.CompanyName.CompanyNames || []);
  console.log(company);

  // filter company name according to financial productconst filteredCompanies = company.filter(
  const filteredCompanies = company.filter(
    (item) => item.financialProduct?._id === formData.cat
  );

  useEffect(() => {
    if (data) {
      // setFormData(data);
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


  

  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        cat: flat?.cat?._id,
        sub: flat?.sub,
        depart: flat?.depart,
        name: flat?.name,
        type: flat?.type,
        descp: { text: flat?.descp?.text, image: flat?.descp?.image },
        email_descp: flat?.email_descp,
        sms_descp: flat?.sms_descp,
        whatsapp_descp: flat?.whatsapp_descp,
        checklists: flat?.checklists?.map((item) => item) || [""],
        formChecklists:
          flat?.formChecklists?.map((item) => ({
            name: item?.name,
            downloadFormUrl: item?.downloadFormUrl,
            sampleFormUrl: item?.sampleFormUrl,
          })) || [],
      }));
    }
  }, [data]);

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
  // checklist
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
      console.log(filteredCompanies);
      // Prepare form data
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
        console.log(formData);
        console.log(data?.task?._id);
        
        await dispatch(
          updateCompositeTask({ id: data?.task?._id, formData: formDataToSend })
        );
      } else {
        await dispatch(createCompositeTask(formDataToSend));
      }

      // Reset form
      setFormData({
        cat: "",
        sub: "",
        depart: "",
        name: "",
        type: "marketing",
        descp: { text: "", image: null },
        email_descp: "",
        sms_descp: "",
        whatsapp_descp: "",
        checklists: [""],
        formChecklists: [
          { name: "", downloadFormUrl: null, sampleFormUrl: null },
        ],
      });

      // Switch to view mode and clear update data
      on("view");
      onSuccess();

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

  console.log(flat);

  return (
    <div className="">
      <div className="card shadow-lg">
        <div className="card-header  text-black">
          <h3 className="text-center card-title mt-4">Composite Task Form</h3>
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
                    // value={formData.cat || flat?.cat?._id}
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
                    value={formData.sub }
                    onChange={handleChange}
                  >
                    <option value="">Choose Company Name</option>
                    {company.map((comp) => (
                      <option key={comp._id} value={comp.companyName}>
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
                          data={formData?.descp?.text } // Fallback to empty string
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
                            
                          {flat?._id && !editImage ? (
                        
                            <div className="flex justify-center items-center p-4">

                            
                              <img
                                src={`/images/${flat.descImage}`}
                                alt="Uploaded"
                                className=" w-[100px] max-w-sm rounded-xl shadow-md object-cover"
                                width={500} 
                              />
                              <button
                                onClick={() => setEditImage(true)}
                                className="px-4 py-1 border-2 rounded   m-2 bg-black text-white"
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <>
                              {console.log(!flat && !editImage  ) }
                              <label>Attach File</label>
                              <div className="custom-file flex gap-2">
                                <input
                                  type="file"
                                  name="descpImage"
                                  className="bg-gray-300 px-3 py-1 rounded custom-file-input"
                                  id="customFile"
                                  onChange={handleChange}
                                />
                                <label
                                  className=" bg-red-500 custom-file-label"
                                  htmlFor="customFile"
                                ></label>
                                <button
                                  onClick={() => setEditImage(false)}
                                  className="bg-red-900 text-white border rounded px-4 py-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          )}
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
                      {formData?.checklists?.map((checklist, index) => (
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
                          data={formData?.email_descp }
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
                          data={formData?.sms_descp }
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
                          data={formData?.whatsapp_descp }
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
                {/* <div
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
                      {formData?.formChecklists?.map((item, index) => (
                        <div
                          key={index}
                          className="border rounded p-3 mb-3 d-flex g-4 justify-content-between w-100"
                        >
                          <div className="form-group ">
                            <label>Form Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                 item.name
                              }
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

                          {flat && !editDownloadImage ? (
                            flat?.formChecklists?.map((imgs, index) => (
                              <div
                                key={index}
                                className=" w-[5  0px] h-[20px] flex justify-center items-center p-4"
                              >
                                <img
                                  src={`/images/${imgs.downloadFormUrl}`}
                                  alt="Uploaded"
                                  className=" w-[50px]  max-w-sm rounded-xl shadow-md object-cover"
                                />
                                <button
                                  onClick={() => SetEditDownloadImage(true)}
                                  className="px-4 py-1 border-2 rounded   m-2 bg-black text-white"
                                >
                                  Edit
                                </button>
                              </div>
                            ))
                          ) : (
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

                              <button
                                onClick={() =>
                                  SetEditDownloadImage(!editDownloadImage)
                                }
                                className="bg-red-900 px-4 py-1 text-white 
                                flex mt-2 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {flat && !editDownloadSampleImage ? (
                            flat?.formChecklists?.map((imgs, index) => (
                              <div
                                key={index}
                                className=" w-[5  0px] h-[20px] flex justify-center items-center p-4"
                              >
                                <img
                                  src={`/images/${imgs.sampleFormUrl}`}
                                  alt="Uploaded"
                                  className=" w-[50px]  max-w-sm rounded-xl shadow-md object-cover"
                                />
                                <button
                                  onClick={() =>
                                    SetEditDownloadSampleImage(true)
                                  }
                                  className="px-4 py-1 border-2 rounded   m-2 bg-black text-white"
                                >
                                  Edit
                                </button>
                              </div>
                            ))
                          ) : (
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

                              <button
                                onClick={() =>
                                  SetEditDownloadSampleImage(
                                    !editDownloadSampleImage
                                  )
                                }
                                className="bg-red-900 px-4 py-1 text-white 
                                flex mt-2 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

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
          
                </div> */}
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
        <FaPlus className="me-1" /> Add Form
      </button>
    </div>
    <div className="card-body">
      {/* Debug Information - Remove in production */}
      {/* <div className="alert alert-info">
        <small>
          <strong>Debug Info:</strong><br/>
          formData exists: {formData ? 'Yes' : 'No'}<br/>
          formChecklists length: {formData?.formChecklists?.length || 0}<br/>
          flat exists: {flat ? 'Yes' : 'No'}<br/>
          flat formChecklists length: {flat?.formChecklists?.length || 0}
        </small>
      </div> */}

      {/* Show message if no form checklists */}
      {(!formData?.formChecklists || formData.formChecklists.length === 0) ? (
        <div className="text-center py-4">
          <p className="text-muted">No form checklists added yet.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={addFormChecklist}
          >
            Add First Form Checklist
          </button>
        </div>
      ) : (
        // Render form checklists
        formData.formChecklists.map((item, index) => (
          <div
            key={index}
            className="border rounded p-3 mb-3"
          >
            <div className="row g-3 align-items-end">
              {/* Form Name */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Form Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item?.name || ""}
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
              </div>

              {/* Blank Form */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Blank Form</label>
                  
                  {/* Show existing image if available and not in edit mode */}
                  {item?.downloadFormUrl && 
                   typeof item.downloadFormUrl === 'string' && 
                   !editDownloadImage ? (
                    <div className="d-flex align-items-center">
                      <img
                                                         src={`/images/${item.downloadFormUrl}`}
                        alt="Blank Form"
                        className="img-thumbnail me-2"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        onError={(e) => {
                          console.log('Image load error:', e);
                          e.target.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => SetEditDownloadImage(true)}
                        className="btn btn-sm btn-dark"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    // Show file input
                    <div>
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
                        accept="image/*,.pdf"
                      />
                      {item?.downloadFormUrl &&
                        typeof item.downloadFormUrl === "string" && (
                          <small className="text-success">
                            Existing file: {item.downloadFormUrl}
                          </small>
                        )}
                      {editDownloadImage && (
                        <button
                          type="button"
                          onClick={() => SetEditDownloadImage(false)}
                          className="btn btn-sm btn-danger mt-2"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sample Form */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Sample Form</label>
                  
                  {/* Show existing image if available and not in edit mode */}
                  {item?.sampleFormUrl && 
                   typeof item.sampleFormUrl === 'string' && 
                   !editDownloadSampleImage ? (
                    <div className="d-flex align-items-center">
                      <img
                                                         src={`/images/${item.sampleFormUrl}`}
                        alt="Sample Form"
                        className="img-thumbnail me-2"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        onError={(e) => {
                          console.log('Image load error:', e);
                          e.target.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => SetEditDownloadSampleImage(true)}
                        className="btn btn-sm btn-dark"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    // Show file input
                    <div>
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
                        accept="image/*,.pdf"
                      />
                      {item?.sampleFormUrl &&
                        typeof item.sampleFormUrl === "string" && (
                          <small className="text-success">
                            Existing file: {item.sampleFormUrl}
                          </small>
                        )}
                      {editDownloadSampleImage && (
                        <button
                          type="button"
                          onClick={() => SetEditDownloadSampleImage(false)}
                          className="btn btn-sm btn-danger mt-2"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              <div className="col-md-3 text-end">
                {formData.formChecklists.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeFormChecklist(index)}
                  >
                    <FaTrash className="me-1" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
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

export default Addtask;