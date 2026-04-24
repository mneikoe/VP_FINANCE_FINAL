import React, { useState } from "react";

import AddImpDocument from "./AddImpDocument";
import ImpDocumentDetail from "./ImpDocumentDetail";
import OfficeModuleLayout from "../../common/OfficeModuleLayout";

function ImpDocument() {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);
  const tabs = [
    { key: "add", label: "Add Document" },
    { key: "view", label: "View Document" },
  ];

  return (
    <OfficeModuleLayout
      title="Important Documents"
      subtitle="Upload and manage critical office documents in one place."
      activeTab={activeTab}
      onTabChange={(tabKey) => {
        if (tabKey === "add") {
          setEditId(null);
        }
        setActiveTab(tabKey);
      }}
      tabs={tabs}
    >
        {activeTab === "add" ? (
          <AddImpDocument
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            editId={editId}
          />
        ) : (
          <ImpDocumentDetail
            setActiveTab={setActiveTab}
            setEditId={setEditId}
          />
        )}
    </OfficeModuleLayout>
  );
}

export default ImpDocument;
