// src/components/Footer.jsx
import React from 'react';

const Footer = ({ siteTitle, mainColor, lightenedShade }) => (
  <footer className="py-8 mt-16" style={{ backgroundColor: lightenedShade }}>
    <div className="container mx-auto px-4 text-center">
      <p style={{ color: mainColor }}>&copy; {new Date().getFullYear()} {siteTitle}. All rights reserved.</p>
      <p className="mt-2 text-gray-600">Elevating your style with grace and sophistication.</p>
    </div>
  </footer>
);

export default Footer;