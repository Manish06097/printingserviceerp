// components/DashboardBreadcrumb.tsx

"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/solid"; // Ensure correct Heroicons v2 import

// Assuming you have a breadcrumbNameMap that maps route segments to display names
import { breadcrumbNameMap } from "@/lib/breadcrumbs"; 

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  // Remove 'dashboard' from pathSegments to prevent duplication
  const filteredPathSegments = pathSegments[0] === "dashboard" ? pathSegments.slice(1) : pathSegments;

  const formatSegment = (segment: string) => {
    const idPattern = /^[0-9a-fA-F]{24}$/; // Example pattern for MongoDB ObjectIDs

    if (idPattern.test(segment)) {
      return "Details";
    }

    return (
      breadcrumbNameMap[segment] ||
      segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };

  const breadcrumbs = filteredPathSegments.map((segment, index) => {
    const href = "/dashboard/" + filteredPathSegments.slice(0, index + 1).join("/");
    const isLast = index === filteredPathSegments.length - 1;

    return {
      label: formatSegment(segment),
      href: href,
      isCurrentPage: isLast,
    };
  });

  return (
    <nav
      aria-label="breadcrumb"
      className="bg-white py-3 px-5 rounded-lg shadow-md hidden md:flex"
    >
      <ol className="flex items-center space-x-2">
        {/* Dashboard Home */}
        <li className="flex items-center">
          <Link href="/dashboard" className="text-black hover:text-gray-700 flex items-center">
            <HomeIcon className="w-5 h-5 mr-1" />
            Dashboard
          </Link>
        </li>

        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            <ChevronRightIcon className="w-5 h-5 text-black mx-2" />
            {crumb.isCurrentPage ? (
              <span className="text-black font-semibold">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-black hover:text-gray-700">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default DashboardBreadcrumb;
