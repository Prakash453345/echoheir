// src/components/Layout.jsx
import React from 'react';

const Layout = ({ children }) => {
  return (
    <>
      {/* Remove Navbar from here if it exists */}
      {children}
    </>
  );
};

export default Layout;