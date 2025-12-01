// src/Layout/Layout.js
import React from "react";
import Navbarfrist from "../Components/Dashbord/Navbarfrist";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Navbarfrist />
      <div className="px-5 mb-4   rounded-sam">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
