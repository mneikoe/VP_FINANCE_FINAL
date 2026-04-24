import React, { useState } from "react";
import AMC from "./AMC";
import AMCDetail from "./AMCDetail";
import OfficeModuleLayout from "../../common/OfficeModuleLayout";

function AMCtabs() {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);
  const tabs = [
    { key: "add", label: "Add AMC Name" },
    { key: "view", label: "View AMC Name" },
  ];

  return (
    <OfficeModuleLayout
      title="AMC Master"
      subtitle="Create and maintain AMC names for mutual fund mapping."
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
          <AMC
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            editId={editId}
          />
        ) : (
          <AMCDetail setActiveTab={setActiveTab} setEditId={setEditId} />
        )}
    </OfficeModuleLayout>
  );
}

export default AMCtabs;
