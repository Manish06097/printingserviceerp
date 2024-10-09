"use client";

import Link from 'next/link';
import { useState, useEffect } from "react";
import {
  Home,
  Package,
  PanelLeft,
  Settings,
  Users2,Users, UserCheck, BarChart
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { User } from './user'; // Importing the User component
import Providers from './providers';
import { NavItem } from './nav-item';
import { SearchInput } from './search';
import DashboardBreadcrumb from "@/components/dashboard-breadcrumb";

// This is the client component for the Dashboard layout
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [userInfo, setUserInfo] = useState({
    userId: "",
    name: "",
    email: "",
    role: "ADMIN", // Default role
  });

  // UseEffect for fetching user data from cookies
  useEffect(() => {
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
      return '';
    };

    

    // Fetch cookies in the client
    const userId = getCookieValue('userId');
    const name = getCookieValue('name');
    const email = getCookieValue('email');
    const role = getCookieValue('role');

    // Set the userInfo state based on the cookie values
    setUserInfo({ userId, name, email, role });

    
  }, []); // Empty dependency array ensures this runs once

  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav userInfo={userInfo} /> {/* Pass userInfo to the navigation */}
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <DashboardBreadcrumb />
            <SearchInput />
            <User email={userInfo.email} name={userInfo.name} role={userInfo.role} />
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
      </main>
    </Providers>
  );
}

// DesktopNav component
function DesktopNav({ userInfo }: { userInfo: { userId: string, name: string, email: string, role: string } }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="https://vercel.com/templates/next.js/admin-dashboard-tailwind-postgres-react-nextjs"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <span className="sr-only">Acme Inc</span>
        </Link>

        <NavItem href="/" label="Dashboard">
  <Home className="h-5 w-5" />
</NavItem>

{/* Conditionally render based on role */}
{userInfo.role === 'SUPER_ADMIN' && (
  <NavItem href="/dashboard/users" label="User management">
    <Users className="h-5 w-5" /> {/* Replacing with Users icon */}
  </NavItem>
)}
{userInfo.role === 'SUPER_ADMIN' && (
<NavItem href="/dashboard/employees" label="Employee management">
  <UserCheck className="h-5 w-5" /> {/* Replacing with UserCheck icon */}
</NavItem>


)}

<NavItem href={"/dashboard/stocks"} label="Stocks Management">
      <BarChart className="h-5 w-5" /> {/* Replacing with BarChart icon */}
    </NavItem>

    <NavItem href={"/dashboard/party"} label="Party Management">
      <BarChart className="h-5 w-5" /> {/* Replacing with BarChart icon */}
    </NavItem>

    <NavItem href={"/dashboard/job"} label="Job Management">
      <BarChart className="h-5 w-5" /> {/* Replacing with BarChart icon */}
    </NavItem>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

// MobileNav component
function MobileNav({ userInfo }: { userInfo: { userId: string, name: string, email: string, role: string } }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          {userInfo.role === 'SUPER_ADMIN' && (
            <Link href="/dashboard/users" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Users2 className="h-5 w-5" />
              User management
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
