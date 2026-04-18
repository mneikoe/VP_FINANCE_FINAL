// src/Layout/Layout.js
import React from "react";
import Navbarfrist from "../Components/Dashbord/Navbarfrist";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  return (
    <>
      <Navbarfrist />
      <div className="p-5 mb-4 rounded-sam">
        <Outlet key={location.pathname} />
      </div>
    </>
  );
};

export default Layout;
