import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-white py-4 shadow-md mb-6">
      <div className="container mx-auto flex items-center justify-center">
        <img
          src={`${process.env.PUBLIC_URL}/images/bruneau.png`}
          alt="Logo"
          className="w-32 h-32"
        />
      </div>
    </header>
  );
};

export default Header;
