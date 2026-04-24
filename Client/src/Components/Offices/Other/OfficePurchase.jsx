import React, { useState } from "react";
import AddOfficePurchase from "./AddOfficePurchase";
import OfficePurchaseDetail from "./OfficePurchaseDetail";
import OfficeModuleLayout from "../common/OfficeModuleLayout";

function OfficePurchase() {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);
  const tabs = [
    { key: "add", label: "Add Office Purchase" },
    { key: "view", label: "View Office Purchase" },
  ];

  return (
    <OfficeModuleLayout
      title="Office Purchase"
      subtitle="Track office purchase entries with streamlined add/view workflow."
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
          <AddOfficePurchase
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            editId={editId}
          />
        ) : (
          <OfficePurchaseDetail
            setActiveTab={setActiveTab}
            setEditId={setEditId}
          />
        )}
    </OfficeModuleLayout>
  );
}

export default OfficePurchase;
