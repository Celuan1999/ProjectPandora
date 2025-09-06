"use client"

import Image from "next/image";
import Button, { ColorTypes } from "./ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
// import Logo from "@/public/logo.png";
import { useUser } from '@/app/context/userContext'
import { createClient } from '@/app/utils/supabase/component'

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
  const { user, isAuthenticated, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    router.push('/');
  };

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
          
          {/* Auth Section */}
          <div className="p-4 border-t border-gray-200">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : isAuthenticated() ? (
              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-600">Welcome,</div>
                <div className="font-semibold text-gray-900">
                  {user?.user?.user_metadata?.full_name || user?.user?.email || 'User'}
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="/settings" onClick={onClose}>
                    <Button color={ColorTypes.secondary} className="w-full py-2 text-sm">
                      Profile
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleLogout}
                    color={ColorTypes.secondary} 
                    className="w-full py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
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
            )}
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
  const { user, isAuthenticated, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      <div className="hidden lg:flex gap-12 ml-auto px-8 items-center justify-center">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className={getLinkClasses(item.href)}>
            {item.label}
          </Link>
        ))}
      </div>
      <div className="hidden lg:flex gap-4 px-4 items-center">
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
        ) : isAuthenticated() ? (
          <div className="relative">
            {/* Profile Icon Button */}
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <img
                src="https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg"
                alt="Profile"
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="text-sm text-gray-600">Signed in as</div>
                    <div className="font-medium text-gray-900 truncate">
                      {user?.user?.email}
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Link 
                      href="/settings" 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <Link href="/login">
              <Button color={ColorTypes.secondary}>Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Register</Button>
            </Link>
          </>
        )}
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