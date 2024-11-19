import React, { useRef, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export const UserDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 
          rounded-md transition-colors text-sm"
      >
        <User size={16} />
        <span>{user?.username}</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg 
            border border-gray-700 py-1 z-50"
        >
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700 
              flex items-center gap-2"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
};