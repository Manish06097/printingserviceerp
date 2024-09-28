"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontalIcon, EditIcon, TrashIcon } from "lucide-react";
import { toast } from "react-toastify"; // Optional: For notifications

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "ADMIN", // Default role
    password: "",
  });

  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "ADMIN",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`Error fetching users: ${res.statusText}`);
      }

      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete user.");
      }

      setUsers(users.filter((u) => u.id !== user.id));
      toast.success("User deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message);
    }
  };

  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          password: newUser.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add user.");
      }

      const addedUser: User = await res.json();
      setUsers([...users, addedUser]);
      setIsAddModalOpen(false); // Close the modal after successful submission

      // Reset the form
      setNewUser({
        name: "",
        email: "",
        role: "ADMIN",
        password: "",
      });

      setError(null); // Clear any existing errors
      toast.success("User added successfully!");
    } catch (error: any) {
      console.error("Error adding user:", error);
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    // Basic form validation
    if (!editUser.name || !editUser.email) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update user.");
      }

      const updatedUser: User = await res.json();
      setUsers(
        users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      setIsEditModalOpen(false); // Close the modal after successful submission

      setError(null); // Clear any existing errors
      toast.success("User updated successfully!");
    } catch (error: any) {
      console.error("Error updating user:", error);
      setError(error.message);
      toast.error(error.message);
    }
  };

  const columns: ColumnDef<User>[] = [
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
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("updatedAt"));
        return date.toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        const isSuperAdmin = user.role === "SUPER_ADMIN";

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
                  if (!isSuperAdmin) handleEditUser(user);
                }}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Update
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSuperAdmin}
                onSelect={() => {
                  if (!isSuperAdmin) handleDeleteUser(user);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">User Management</h1>
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      <DataTable
        columns={columns}
        data={users}
        onAddItem={handleAddUser}
        buttonText="Add User" // Dynamic button text
        pageSize={10} // Limit to 5 users per page
      />

      {/* Modal for Adding New User */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleAddFormSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              type="text"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
              className="w-full border rounded px-2 py-1"
              required
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="STAFF">STAFF</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button type="submit">Add User</Button>
        </form>
      </Modal>

      {/* Modal for Editing User */}
      {selectedUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                type="text"
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={editUser.role}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="STAFF">STAFF</option>
              </select>
            </div>

            {/* Submit Button */}
            <Button type="submit">Update User</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// useEffect(() => {
//   // Check if we're in the browser
//   if (typeof window !== 'undefined') {
//     const getCookieValue = (name: string) => {
//       const value = `; ${document.cookie}`;
//       const parts = value.split(`; ${name}=`);
//       if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
//       return '';
//     };

//     const userId = getCookieValue('userId');
//     const name = getCookieValue('name');
//     const email = getCookieValue('email');
//     const role = getCookieValue('role');

//     setUserInfo({ userId, name, email, role });
//   }
// }, []);
