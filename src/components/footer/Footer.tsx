import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 w-full mt-auto">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          Tout droit réservé &copy; {new Date().getFullYear()} Bruneau
          Électrique
        </p>
      </div>
    </footer>
  );
};

export default Footer;
