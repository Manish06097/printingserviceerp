// components/DashboardBreadcrumb.tsx

"use client";
import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"; // Adjust the import path
import { breadcrumbNameMap } from "@/lib/breadcrumbs"; // Ensure this is imported

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  const formatSegment = (segment: string) => {
    // If the segment is a dynamic ID, fetch the corresponding name
    // For simplicity, let's assume dynamic segments are IDs and fetch their names
    // You might need to implement a context or a state to hold names of dynamic segments

    // Example: If segment matches an ID pattern, return "User Details" or similar
    const idPattern = /^[0-9a-fA-F]{24}$/; // Example pattern for MongoDB ObjectIDs

    if (idPattern.test(segment)) {
      // You can customize this based on your application's needs
      return "Details"; // Or fetch and return the actual name associated with the ID
    }

    return breadcrumbNameMap[segment] || segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");

    const isLast = index === pathSegments.length - 1;

    return {
      label: formatSegment(segment),
      href: href,
      isCurrentPage: isLast,
    };
  });

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {/* Always include the Dashboard link as the first breadcrumb */}
        {/* <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem> */}
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.isCurrentPage ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default DashboardBreadcrumb;
