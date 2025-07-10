import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-border-color h-[70px] fixed left-0 right-0 top-0 z-[1000] px-5 py-3.5">
      <div className="flex items-center h-full">
        <h1 className="text-text-primary text-2xl font-semibold m-0">Template Ads</h1>
      </div>
    </header>
  );
};

export default Header;