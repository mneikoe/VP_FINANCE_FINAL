import React, { useState } from "react";
import AddCompanyName from "./AddCompanyName";
import CompanyDetail from "./CompanyDetail";
import OfficeModuleLayout from "../common/OfficeModuleLayout";

function CompanyTabs() {
  const [activeTab, setActiveTab] = useState("add");

  const [editId, setEditId] = useState(null);
  const tabs = [
    { key: "add", label: "Add Company Name" },
    { key: "view", label: "View Company Name" },
  ];

  return (
    <OfficeModuleLayout
      title="Financial Product & Company Name"
      subtitle="Maintain insurer/broker/company details mapped to financial products."
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
          <div>
            {/* Add Company Name content */}
            <AddCompanyName
              setActiveTab={setActiveTab}
              setEditId={setEditId}
              editId={editId}
            />
          </div>
        ) : (
          <div>
            {/* Company Detail content */}
            <CompanyDetail setActiveTab={setActiveTab} setEditId={setEditId} />
          </div>
        )}
    </OfficeModuleLayout>
  );
}

export default CompanyTabs;
