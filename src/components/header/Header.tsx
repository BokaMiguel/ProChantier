import React, { useEffect, useRef, useState } from "react";
import "./Header.scss";

const Header: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        setIsSticky(window.scrollY > headerRef.current.offsetTop);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={`header ${isSticky ? "sticky" : ""} bg-white shadow-md mb-6`}
    >
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
