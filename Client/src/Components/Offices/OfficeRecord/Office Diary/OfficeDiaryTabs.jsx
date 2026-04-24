import React, { useState } from "react";
import AddOfficeDiary from "./AddOfficeDiary";
import OfficeDiaryDetail from "./OfficeDiaryDetail";
import OfficeModuleLayout from "../../common/OfficeModuleLayout";

function OfficeDiaryTabs() {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(null);
  const tabs = [
    { key: "add", label: "Add Diary Name" },
    { key: "view", label: "View Diary Name" },
  ];

  return (
    <OfficeModuleLayout
      title="Office Diary"
      subtitle="Manage office diary masters and review previously created entries."
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
          <AddOfficeDiary
            setActiveTab={setActiveTab}
            setEditId={setEditId}
            editId={editId}
          />
        ) : (
          <OfficeDiaryDetail
            setActiveTab={setActiveTab}
            setEditId={setEditId}
          />
        )}
    </OfficeModuleLayout>
  );
}

export default OfficeDiaryTabs;
