// src/components/EmployeeManagementPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontalIcon, EditIcon, TrashIcon } from "lucide-react";
import { toast } from "react-toastify"; // For notifications
import Select from "react-select"; // For searchable dropdown

// Import shadcn's Tabs components
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"; // Adjust the import path based on your project structure

// Define TypeScript interfaces
interface Employee {
  id: number;
  name: string;
  email: string;
  role: "STAFF" | "ADMIN" | "SUPER_ADMIN";
  startDate: string; // ISO-8601 DateTime string
  salary: number;
  status: "ACTIVE" | "INACTIVE";
}

interface AttendanceRecord {
  id: number;
  employeeId: number;
  date: string; // ISO-8601 DateTime string
  checkIn: string; // ISO-8601 DateTime string
  checkOut: string; // ISO-8601 DateTime string
  status: "PRESENT" | "ABSENT" | "LEAVE";
}

interface OptionType {
  value: number;
  label: string;
}

export default function EmployeeManagementPage() {
  // Constants for default times
  const DEFAULT_CHECKIN = "09:00";
  const DEFAULT_CHECKOUT = "21:00";

  // Employee State Management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form states for adding new employee
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "STAFF" as "STAFF" | "ADMIN" | "SUPER_ADMIN", // Default role
    startDate: "",
    salary: 0,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    password: "", // Added password field
  });

  // Form states for editing existing employee
  const [editEmployee, setEditEmployee] = useState({
    name: "",
    email: "",
    role: "STAFF" as "STAFF" | "ADMIN" | "SUPER_ADMIN",
    startDate: "",
    salary: 0,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  // Attendance State Management
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedAttendanceEmployeeId, setSelectedAttendanceEmployeeId] = useState<number | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [isAddAttendanceModalOpen, setIsAddAttendanceModalOpen] = useState(false);

  // Form state for adding new attendance
  const [newAttendance, setNewAttendance] = useState({
    employeeId: 0,
    date: "",
    checkIn: DEFAULT_CHECKIN, // Default Check-In Time
    checkOut: DEFAULT_CHECKOUT, // Default Check-Out Time
    status: "PRESENT" as "PRESENT" | "ABSENT" | "LEAVE", // Changed from "ON_LEAVE" to "LEAVE"
  });

  // Options for react-select
  const [employeeOptions, setEmployeeOptions] = useState<OptionType[]>([]);

  useEffect(() => {
    fetchEmployees();
    // Do not fetch attendance records here; they will be fetched when the Attendance tab is active
  }, []);

  // Utility function to validate dates
  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`Error fetching employees: ${res.statusText}`);
      }

      const data: Employee[] = await res.json();
      setEmployees(data);

      // Set options for react-select (Only employee names)
      const options = data.map((emp) => ({
        value: emp.id,
        label: emp.name, // Removed ID from label
      }));
      setEmployeeOptions(options);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance records for a specific employee
  const fetchAttendanceRecords = async (employeeId: number) => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const res = await fetch(`/api/admin/employees/attendance/${employeeId}`, {
        method: "GET",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch attendance records.");
      }

      const data: AttendanceRecord[] = await res.json();
      setAttendanceRecords(data);
    } catch (error: any) {
      setAttendanceError(error.message);
      setAttendanceRecords([]); // Clear records on error
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (value !== "attendance") {
      // Reset attendance-related states
      setSelectedAttendanceEmployeeId(null);
      setAttendanceRecords([]);
      setAttendanceError(null);
    }
  };

  // Employee Handlers
  const handleAddEmployee = () => {
    setIsAddModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditEmployee({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      startDate: employee.startDate, // ISO string
      salary: employee.salary,
      status: employee.status,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to delete employee "${employee.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/employees/${employee.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete employee.");
      }

      setEmployees(employees.filter((e) => e.id !== employee.id));

      // Update react-select options
      setEmployeeOptions(employeeOptions.filter((opt) => opt.value !== employee.id));

      toast.success("Employee deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      toast.error(error.message);
    }
  };

  // Handle form submission to add new employee
  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (
      !newEmployee.name ||
      !newEmployee.email ||
      !newEmployee.startDate ||
      !newEmployee.salary ||
      !newEmployee.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate startDate
    if (!isValidDate(newEmployee.startDate)) {
      setError("Please provide a valid start date.");
      return;
    }

    // Convert startDate to ISO-8601 DateTime string
    const isoStartDate = new Date(newEmployee.startDate).toISOString();

    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newEmployee,
          startDate: isoStartDate, // Use the ISO-formatted date
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add employee.");
      }

      const addedEmployee: Employee = await res.json();
      setEmployees([...employees, addedEmployee]);
      setIsAddModalOpen(false); // Close the modal after successful submission

      // Reset the form
      setNewEmployee({
        name: "",
        email: "",
        role: "STAFF",
        startDate: "",
        salary: 0,
        status: "ACTIVE",
        password: "",
      });

      // Update react-select options
      setEmployeeOptions([
        ...employeeOptions,
        { value: addedEmployee.id, label: addedEmployee.name },
      ]);

      setError(null); // Clear any existing errors
      toast.success("Employee added successfully!");
    } catch (error: any) {
      console.error("Error adding employee:", error);
      setError(error.message);
      toast.error(error.message);
    }
  };

  // Handle form submission to edit existing employee
  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee) return;

    // Basic form validation
    if (
      !editEmployee.name ||
      !editEmployee.email ||
      !editEmployee.startDate ||
      !editEmployee.salary
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate startDate
    if (!isValidDate(editEmployee.startDate)) {
      setError("Please provide a valid start date.");
      return;
    }

    // Convert startDate to ISO-8601 DateTime string
    const isoStartDate = new Date(editEmployee.startDate).toISOString();

    try {
      const res = await fetch(`/api/admin/employees/${selectedEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editEmployee,
          startDate: isoStartDate, // Use the ISO-formatted date
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update employee.");
      }

      const updatedEmployee: Employee = await res.json();
      setEmployees(
        employees.map((e) => (e.id === updatedEmployee.id ? updatedEmployee : e))
      );
      setIsEditModalOpen(false); // Close the modal after successful submission

      // Update react-select options
      setEmployeeOptions(
        employeeOptions.map((opt) =>
          opt.value === updatedEmployee.id
            ? { ...opt, label: updatedEmployee.name }
            : opt
        )
      );

      setError(null); // Clear any existing errors
      toast.success("Employee updated successfully!");
    } catch (error: any) {
      console.error("Error updating employee:", error);
      setError(error.message);
      toast.error(error.message);
    }
  };

  // Attendance Handlers
  const handleAttendanceEmployeeChange = (selectedOption: OptionType | null) => {
    if (selectedOption) {
      setSelectedAttendanceEmployeeId(selectedOption.value);
      fetchAttendanceRecords(selectedOption.value);
    } else {
      setSelectedAttendanceEmployeeId(null);
      setAttendanceRecords([]);
    }
  };

  const handleAddAttendance = () => {
    if (selectedAttendanceEmployeeId) {
      setNewAttendance({
        employeeId: selectedAttendanceEmployeeId,
        date: "",
        checkIn: DEFAULT_CHECKIN,
        checkOut: DEFAULT_CHECKOUT,
        status: "PRESENT",
      });
      setIsAddAttendanceModalOpen(true);
    } else {
      toast.error("Please select an employee to record attendance.");
    }
  };

  // Helper function to combine date and time into ISO string with 'Z'
  const combineDateAndTime = (date: string, time: string): string => {
    if (!date || !time) {
      return "Invalid Date";
    }
    const combined = new Date(`${date}T${time}:00Z`);
    if (isNaN(combined.getTime())) {
      return "Invalid Date";
    }
    return combined.toISOString();
  };

  const handleAddAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (
      !newAttendance.employeeId ||
      !newAttendance.date ||
      (newAttendance.status === "PRESENT" && (!newAttendance.checkIn || !newAttendance.checkOut)) ||
      !newAttendance.status
    ) {
      setAttendanceError("Please fill in all required fields.");
      return;
    }

    try {
      let formattedCheckIn = `${newAttendance.date}T00:00:00Z`; // Default Check-In Time
      let formattedCheckOut = `${newAttendance.date}T00:00:00Z`; // Default Check-Out Time

      if (newAttendance.status === "PRESENT") {
        formattedCheckIn = combineDateAndTime(newAttendance.date, newAttendance.checkIn);
        formattedCheckOut = combineDateAndTime(newAttendance.date, newAttendance.checkOut);
      }

      // Validate formatted dates
      if (formattedCheckIn === "Invalid Date" || formattedCheckOut === "Invalid Date") {
        throw new Error("Invalid date or time format.");
      }

      const payload = {
        employeeId: newAttendance.employeeId,
        date: newAttendance.date, // Keeping date as YYYY-MM-DD
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
        status: newAttendance.status, // Now sends "LEAVE" if selected
      };

      console.log("Attendance Payload:", payload); // Debugging line

      const res = await fetch("/api/admin/employees/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to record attendance.");
      }

      const addedAttendance: AttendanceRecord = await res.json();
      setAttendanceRecords([...attendanceRecords, addedAttendance]);
      setIsAddAttendanceModalOpen(false); // Close the modal after successful submission

      // Reset the form
      setNewAttendance({
        employeeId: selectedAttendanceEmployeeId || 0,
        date: "",
        checkIn: DEFAULT_CHECKIN,
        checkOut: DEFAULT_CHECKOUT,
        status: "PRESENT",
      });

      setAttendanceError(null); // Clear any existing errors
      toast.success("Attendance recorded successfully!");
    } catch (error: any) {
      console.error("Error recording attendance:", error);
      setAttendanceError(error.message);
      toast.error(error.message);
    }
  };

  // Handle changes to the Status field
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as "PRESENT" | "ABSENT" | "LEAVE";
    setNewAttendance({
      ...newAttendance,
      status,
      // Reset times if status is not PRESENT
      checkIn: status === "PRESENT" ? newAttendance.checkIn : "00:00",
      checkOut: status === "PRESENT" ? newAttendance.checkOut : "00:00",
    });
  };

  // Handle changes to Check-In Time
  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checkIn = e.target.value;
    setNewAttendance({ ...newAttendance, checkIn });
  };

  // Handle changes to Check-Out Time
  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checkOut = e.target.value;
    setNewAttendance({ ...newAttendance, checkOut });
  };

  // Columns for Employee DataTable
  const employeeColumns: ColumnDef<Employee>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("startDate"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "salary",
      header: "Salary",
      cell: ({ row }) => `$${row.getValue("salary").toLocaleString()}`,
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const employee = row.original;
        const isSuperAdmin = employee.role === "SUPER_ADMIN";

        return (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="bg-white shadow-md rounded-md p-1">
              <DropdownMenu.Item
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSuperAdmin}
                onSelect={() => {
                  if (!isSuperAdmin) handleEditEmployee(employee);
                }}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Update
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSuperAdmin}
                onSelect={() => {
                  if (!isSuperAdmin) handleDeleteEmployee(employee);
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2 text-red-500" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        );
      },
    },
  ];

  // Columns for Attendance DataTable
  const attendanceColumns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "employeeId",
      header: "Employee ID",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "checkIn",
      header: "Check-In",
      cell: ({ row }) => {
        const checkIn = new Date(row.getValue("checkIn"));
        if (isNaN(checkIn.getTime())) {
          return "Invalid Time";
        }
        return checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      },
    },
    {
      accessorKey: "checkOut",
      header: "Check-Out",
      cell: ({ row }) => {
        const checkOut = new Date(row.getValue("checkOut"));
        if (isNaN(checkOut.getTime())) {
          return "Invalid Time";
        }
        return checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      },
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    // Add more columns as needed
  ];

  // Render loading state
  if (loading) {
    return <div>Loading employees...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Employee Management</h1>
      {(error || attendanceError) && (
        <div className="text-red-500 mb-4">
          Error: {error || attendanceError}
        </div>
      )}

      {/* Tabs Integration */}
      <Tabs defaultValue="employee" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="employee">Employee</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* Employee Tab Content */}
        <TabsContent value="employee">
          <DataTable
            columns={employeeColumns}
            data={employees}
            onAddItem={handleAddEmployee}
            buttonText="Add Employee"
            pageSize={10} // Limit to 10 employees per page
          />

          {/* Modal for Adding New Employee */}
          <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
            <form onSubmit={handleAddFormSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="employee-name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input
                  id="employee-name"
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="employee-email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="employee-email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  required
                />
              </div>

              {/* Start Date Field */}
              <div>
                <label htmlFor="employee-start-date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <Input
                  id="employee-start-date"
                  type="date"
                  value={newEmployee.startDate}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, startDate: e.target.value })
                  }
                  required
                />
              </div>

              {/* Salary Field */}
              <div>
                <label htmlFor="employee-salary" className="block text-sm font-medium text-gray-700">
                  Salary
                </label>
                <Input
                  id="employee-salary"
                  type="number"
                  value={newEmployee.salary}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>

              {/* Status Selection */}
              <div>
                <label htmlFor="employee-status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="employee-status"
                  value={newEmployee.status}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, status: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="employee-role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="employee-role"
                  value={newEmployee.role}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, role: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="employee-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="employee-password"
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                  }
                  required
                />
              </div>

              {/* Submit Button */}
              <Button type="submit">Add Employee</Button>
            </form>
          </Modal>

          {/* Modal for Editing Employee */}
          {selectedEmployee && (
            <Modal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
            >
              <form onSubmit={handleEditFormSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="edit-employee-name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <Input
                    id="edit-employee-name"
                    type="text"
                    value={editEmployee.name}
                    onChange={(e) =>
                      setEditEmployee({ ...editEmployee, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="edit-employee-email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="edit-employee-email"
                    type="email"
                    value={editEmployee.email}
                    onChange={(e) =>
                      setEditEmployee({ ...editEmployee, email: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Start Date Field */}
                <div>
                  <label htmlFor="edit-employee-start-date" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <Input
                    id="edit-employee-start-date"
                    type="date"
                    value={editEmployee.startDate.split("T")[0]} // Extract YYYY-MM-DD
                    onChange={(e) =>
                      setEditEmployee({ ...editEmployee, startDate: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Salary Field */}
                <div>
                  <label htmlFor="edit-employee-salary" className="block text-sm font-medium text-gray-700">
                    Salary
                  </label>
                  <Input
                    id="edit-employee-salary"
                    type="number"
                    value={editEmployee.salary}
                    onChange={(e) =>
                      setEditEmployee({ ...editEmployee, salary: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label htmlFor="edit-employee-status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="edit-employee-status"
                    value={editEmployee.status}
                    onChange={(e) =>
                      setEditEmployee({ ...editEmployee, status: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1"
                    required
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="edit-employee-role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="edit-employee-role"
                    value={editEmployee.role}
                    onChange={(e) =>
                      setEditEmployee({ ...editEmployee, role: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1"
                    required
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                {/* Submit Button */}
                <Button type="submit">Update Employee</Button>
              </form>
            </Modal>
          )}
        </TabsContent>

        {/* Attendance Tab Content */}
        <TabsContent value="attendance">
          <h2 className="text-xl font-semibold mb-4">Attendance Management</h2>

          {/* Employee Selection with react-select */}
          <div className="mb-4">
            <label htmlFor="attendance-employee-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            <Select
              id="attendance-employee-select"
              options={employeeOptions}
              value={
                selectedAttendanceEmployeeId
                  ? {
                      value: selectedAttendanceEmployeeId,
                      label:
                        employeeOptions.find((opt) => opt.value === selectedAttendanceEmployeeId)?.label ||
                        "",
                    }
                  : null
              }
              onChange={handleAttendanceEmployeeChange}
              isClearable
              placeholder="-- Select an Employee --"
              classNamePrefix="react-select"
            />
          </div>

          {/* Attendance DataTable */}
          {attendanceLoading ? (
            <div>Loading attendance records...</div>
          ) : attendanceError ? (
            <div className="text-red-500 mb-4">Error: {attendanceError}</div>
          ) : selectedAttendanceEmployeeId ? (
            <DataTable
              columns={attendanceColumns}
              data={attendanceRecords}
              onAddItem={handleAddAttendance}
              buttonText="Add Attendance"
              pageSize={10} // Limit to 10 records per page
            />
          ) : (
            <div>Please select an employee to view attendance records.</div>
          )}

          {/* Modal for Adding New Attendance */}
          <Modal isOpen={isAddAttendanceModalOpen} onClose={() => setIsAddAttendanceModalOpen(false)}>
            <form onSubmit={handleAddAttendanceSubmit} className="space-y-4">
              {/* Status Selection */}
              <div>
                <label htmlFor="attendance-status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="attendance-status"
                  value={newAttendance.status}
                  onChange={handleStatusChange}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LEAVE">LEAVE</option> {/* Changed from "ON_LEAVE" to "LEAVE" */}
                </select>
              </div>

              {/* Date Field */}
              <div>
                <label htmlFor="attendance-date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <Input
                  id="attendance-date"
                  type="date"
                  value={newAttendance.date}
                  onChange={(e) =>
                    setNewAttendance({ ...newAttendance, date: e.target.value })
                  }
                  required
                />
              </div>

              {/* Check-In Field */}
              <div>
                <label htmlFor="attendance-checkin" className="block text-sm font-medium text-gray-700">
                  Check-In Time
                </label>
                <Input
                  id="attendance-checkin"
                  type="time"
                  value={newAttendance.status === "PRESENT" ? newAttendance.checkIn : "00:00"}
                  onChange={handleCheckInChange}
                  required={newAttendance.status === "PRESENT"} // Required only if PRESENT
                  disabled={newAttendance.status !== "PRESENT"} // Disabled if not PRESENT
                />
              </div>

              {/* Check-Out Field */}
              <div>
                <label htmlFor="attendance-checkout" className="block text-sm font-medium text-gray-700">
                  Check-Out Time
                </label>
                <Input
                  id="attendance-checkout"
                  type="time"
                  value={newAttendance.status === "PRESENT" ? newAttendance.checkOut : "00:00"}
                  onChange={handleCheckOutChange}
                  required={newAttendance.status === "PRESENT"} // Required only if PRESENT
                  disabled={newAttendance.status !== "PRESENT"} // Disabled if not PRESENT
                />
              </div>

              {/* Submit Button */}
              <Button type="submit">Record Attendance</Button>
            </form>
          </Modal>
        </TabsContent>
      </Tabs>
    </div>
  );
}
