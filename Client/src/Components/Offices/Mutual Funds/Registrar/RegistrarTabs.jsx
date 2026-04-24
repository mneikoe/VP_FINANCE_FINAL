import React, { useState } from "react";
import Registrar from "./Registrar";
import RegistrarDetail from "./RegistrarDetail";
import OfficeModuleLayout from "../../common/OfficeModuleLayout";

function RegistrarTabs() {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);
  const tabs = [
    { key: "add", label: "Add Registrar Name" },
    { key: "view", label: "View Registrar Name" },
  ];

  return (
    <OfficeModuleLayout
      title="Mutual Fund Registrar"
      subtitle="Manage registrar master entries used in mutual fund workflows."
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
          <Registrar
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            editId={editId}
          />
        ) : (
          <RegistrarDetail setActiveTab={setActiveTab} setEditId={setEditId} />
        )}
    </OfficeModuleLayout>
  );
}

export default RegistrarTabs;
