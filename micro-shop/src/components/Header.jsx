import React from 'react';
import { FaShoppingCart, FaInfoCircle } from 'react-icons/fa';

const Header = ({ cartItemsCount, onOpenCart, onOpenBankDetails, siteTitle, mainColor, lighterShade }) => {
  // Generate a lighter shade of the main color for hover effects
  const lighterColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgb(${Math.min(r + 20, 255)}, ${Math.min(g + 20, 255)}, ${Math.min(b + 20, 255)})`;
  };

  const hoverColor = lighterColor(mainColor);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-serif" style={{ color: mainColor }}>{siteTitle}</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenBankDetails}
            className="transition-colors duration-300"
            style={{ color: mainColor }}
            onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
            onMouseLeave={(e) => e.currentTarget.style.color = mainColor}
            aria-label="Show bank details"
          >
            <FaInfoCircle size={20} />
          </button>
          <div className="relative">
            <button
              onClick={onOpenCart}
              className="transition-colors duration-300"
              style={{ color: mainColor }}
              onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
              onMouseLeave={(e) => e.currentTarget.style.color = mainColor}
              aria-label="Open shopping cart"
            >
              <FaShoppingCart size={20} />
            </button>
            {cartItemsCount > 0 && (
              <span 
                className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                style={{ backgroundColor: mainColor }}
              >
                {cartItemsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;