// import React, { useState } from "react";
// import SuspectLeadsTable from "./SuspectLeadsTable";
// import AddProspectLead from "./AddProspectLead";
// import ProspectLeadTable from "./ProspectLeadTable";

// const ProspectLeadTabs = () => {
//   const [activeTab, setActiveTab] = useState("add");
//   const [editId, setEditId] = useState(null); // 👈 Track which lead is being edited
//   const [editClientFormData, setEditClientFormData] = useState(null);

//   return (
//     <div className="container mt-4">
//       {/* Tab Buttons */}
//       <div className="d-flex mb-3">
//         <button
//           className={`btn btn-${
//             activeTab === "add" ? "primary" : "outline-primary"
//           } me-2`}
//           onClick={() => {
//             setEditId(null); // clear any editing state when adding fresh
//             setActiveTab("add");
//           }}
//         >
//           Add Suspect Lead
//         </button>
//         <button
//           className={`btn btn-${
//             activeTab === "display" ? "primary" : "outline-primary"
//           }`}
//           onClick={() => setActiveTab("display")}
//         >
//           Display Suspect Leads
//         </button>
//       </div>

//       {/* Tab Content */}
//       <div>
//         {activeTab === "add" && <AddProspectLead editId={editId} />}
//         {activeTab === "display" && (
//           // <ProspectLeadTable
//           //   setActiveTab={setActiveTab}
//           //   setEditId={setEditId}
//           // />
//           <ProspectLeadTable
//             setActiveTab={setActiveTab}
//             setEditId={setEditId}
//             setEditClientFormData={setEditClientFormData}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProspectLeadTabs;

import React, { useState } from "react";
import AddProspectLead from "./AddProspectLead";
import ProspectLeadTable from "./ProspectLeadTable";
// import ClientForm from "../Client/ClientForm"; // 👈 import this
import ClientFirstFrom from "./Client/ClientFirstFrom";

const ProspectLeadTabs = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);
  const [editClientFormData, setEditClientFormData] = useState(null); // 👈 hold mapped data

  return (
    <div className="container mt-4">
      <div className="d-flex mb-3">
        <button
          className={`btn btn-${
            activeTab === "add" ? "primary" : "outline-primary"
          } me-2`}
          onClick={() => {
            setEditId(null);
            setActiveTab("add");
          }}
        >
          Add Prospect Lead
        </button>
        <button
          className={`btn btn-${
            activeTab === "display" ? "primary" : "outline-primary"
          }`}
          onClick={() => setActiveTab("display")}
        >
          Display Prospect Leads
        </button>
      </div>

      <div>
        {activeTab === "add" && <AddProspectLead editId={editId} />}

        {activeTab === "display" && (
          <ProspectLeadTable
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            setEditClientFormData={setEditClientFormData}
          />
        )}

        {activeTab === "clientForm" && (
          <ClientFirstFrom
            initialData={editClientFormData}
            onSaveSuccess={() => {
              setEditClientFormData(null);
              setActiveTab("display");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProspectLeadTabs;
