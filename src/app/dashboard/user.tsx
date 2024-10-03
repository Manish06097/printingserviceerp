"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Mail, User as UserIcon, Shield } from 'lucide-react'; // Icons for styling

export function User({ email, name, role }) {
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'GET',
      });

      if (res.ok) {
        window.location.href = '/login';
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full border-gray-300 hover:border-gray-500"
        >
          <Image
            src={'/placeholder-user.jpg'}
            width={36}
            height={36}
            alt="Avatar"
            className="rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg rounded-lg border border-gray-200">
        <DropdownMenuLabel className="text-sm font-medium text-gray-700 px-4 py-2">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
        
        {/* Display Name */}
        <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
          <UserIcon className="w-4 h-4 text-gray-500" />
          {name}
        </DropdownMenuItem>

        {/* Display Email */}
        <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
          <Mail className="w-4 h-4 text-gray-500" />
          {email}
        </DropdownMenuItem>

        {/* Display Role */}
        <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
          <Shield className="w-4 h-4 text-gray-500" />
          {role}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
        
        {/* Logout Button */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-100 hover:text-red-700"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
