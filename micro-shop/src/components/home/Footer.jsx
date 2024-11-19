// src/components/Footer.jsx
import React from 'react';

const Footer = ({ siteSettings, mainColor, lightenedShade }) => (
  <footer className="py-8 mt-16" style={{ backgroundColor: lightenedShade }}>
    <div className="container mx-auto px-4 text-center">
      <p style={{ color: mainColor }}>&copy; {new Date().getFullYear()} {siteSettings.title}. All rights reserved.</p>
      <p className="mt-2 text-gray-600">{siteSettings.store_tag}</p>
      <div className="mt-4 space-y-1">
        <p>
          <a 
            href={`mailto:${siteSettings.email}`} 
            className="hover:underline transition-colors duration-200"
            style={{ color: mainColor }}
          >
            {siteSettings.email}
          </a>
        </p>
        <p>
          <a 
            href={`tel:${siteSettings.phone}`} 
            className="hover:underline transition-colors duration-200"
            style={{ color: mainColor }}
          >
            {siteSettings.phone}
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;