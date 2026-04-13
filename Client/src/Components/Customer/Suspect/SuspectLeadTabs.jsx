import React, { useState } from "react";
import DisplaySuspect from "./DisplaySuspect";


const SuspectLeadTabs = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState(""); // 👈 Track which lead is being edited
  console.log(editId, "id suspect tab");
  return (
    <div className=" p-1 mt-1">
      <DisplaySuspect/>
    </div>
  );
};

export default SuspectLeadTabs;