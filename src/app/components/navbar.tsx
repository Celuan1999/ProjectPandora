"use client"

import Image from "next/image";
import Button, { ColorTypes } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/public/logo.png";

// Menu items configuration
const menuItems = [
  { href: "/products", label: "Products" },
  { href: "/companies", label: "Companies" },
  { href: "/community", label: "Community" },
  { href: "/collaborate", label: "Collaborate" },
  { href: "/settings", label: "Settings" },
  { href: "/link", label: "Link" },
];

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose, getLinkClasses }: {
  isOpen: boolean;
  onClose: () => void;
  getLinkClasses: (path: string) => string;
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile Menu */}
      <div className={`
        fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Menu Items */}
          <nav className="flex-1 px-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block ${getLinkClasses(item.href)}`}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
          
          {/* Auth Buttons */}
          <div className="p-4 border-t border-gray-200 flex flex-col gap-4">
            <Link href="/login" onClick={onClose}>
              <Button color={ColorTypes.secondary} className="w-full py-3 text-base">
                Sign In
              </Button>
            </Link>
            <Link href="/login" onClick={onClose}>
              <Button className="w-full py-3 text-base">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Hamburger Button Component
const HamburgerButton = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="lg:hidden p-2 text-gray-600 hover:text-gray-800 transition-colors"
    aria-label="Toggle menu"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {isOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  </button>
);

// Desktop Navigation Component
const DesktopNavigation = ({ getLinkClasses }: { getLinkClasses: (path: string) => string }) => {
  return (
    <>
      <div className="hidden lg:flex gap-12 ml-auto px-8 items-center justify-center">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className={getLinkClasses(item.href)}>
            {item.label}
          </Link>
        ))}
      </div>
      <div className="hidden lg:flex gap-4 px-4">
        <Link href="/login">
          <Button color={ColorTypes.secondary}>Sign In</Button>
        </Link>
        <Link href="/login">
          <Button>Register</Button>
        </Link>
      </div>
    </>
  );
};

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getLinkClasses = (path: string) => {
    const baseClasses = "text-md transition-all duration-200 px-2 py-1 rounded-lg";
    const activeClasses = "text-[var(--custom-black)] bg-gray-100 hover:bg-gray-300";
    const inactiveClasses = "text-gray-600 hover:text-[var(--custom-black)] hover:bg-gray-100";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center px-8 py-4 border-b border-slate-200" style={{ height: 'var(--navbar-height, 80px)' }}>
        {/* Logo */}
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={50} height={50} />
        </Link>
        
        {/* Desktop Navigation */}
        <DesktopNavigation getLinkClasses={getLinkClasses} />
        
        {/* Mobile Hamburger Button */}
        <HamburgerButton isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={closeMobileMenu} 
        getLinkClasses={getLinkClasses} 
      />
    </>
  );
}