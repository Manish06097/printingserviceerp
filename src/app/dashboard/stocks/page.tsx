// src/app/dashboard/stocks/page.tsx

"use client";

import React, { useState, useEffect,useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
} from "lucide-react";
import { toast } from "react-toastify"; // For notifications
import Select from "react-select"; // For searchable dropdown
import Image from "next/image"; // For displaying images

// Define TypeScript interfaces
interface StockType {
  id: number;
  name: string;
}

interface StockItemDetails {
  id: number;
  name: string;
  image?: string;
  stockTypeId: number;
  quantityType: "PACKET" | "KG" | "LITER";
  totalQuantity: number;
  totalWeight?: number;
  finalAmount: number;
  status: "ACTIVE" | "CONSUMED";
  createdAt: string;
  updatedAt: string;
}

interface StockEntryItem {
  id: number;
  stockEntryId: number;
  stockItemId: number;
  stockItem: StockItemDetails;
}

interface StockEntry {
  id: number;
  partyName: string;
  dateReceived: string; // ISO-8601 Date string
  createdAt: string;
  updatedAt: string;
  stockItems: StockEntryItem[];
}

interface OptionType {
  value: number;
  label: string;
}

export default function StockEntriesPage() {
  // ----------------------------
  // State Management
  // ----------------------------

  // Stock Entries State
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockEntriesLoading, setStockEntriesLoading] = useState(false);
  const [stockEntriesError, setStockEntriesError] = useState<string | null>(
    null
  );

  // Stock Types State
  const [stockTypes, setStockTypes] = useState<StockType[]>([]);
  const [stockTypesLoading, setStockTypesLoading] = useState(false);
  const [stockTypesError, setStockTypesError] = useState<string | null>(null);
  const [stockTypeOptions, setStockTypeOptions] = useState<OptionType[]>([]);

  // Modal Visibility States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStockTypeModalOpen, setIsAddStockTypeModalOpen] = useState(false);
  const [isStockItemsModalOpen, setIsStockItemsModalOpen] = useState(false);
  const [isEditStockItemModalOpen, setIsEditStockItemModalOpen] =
    useState(false);

  // Selected Stock Entry and Stock Items
  const [selectedStockEntry, setSelectedStockEntry] = useState<StockEntry | null>(
    null
  );
  const [selectedStockItems, setSelectedStockItems] = useState<StockItemDetails[]>(
    []
  );

  // Stock Item to Edit
  const [stockItemToEdit, setStockItemToEdit] = useState<StockItemDetails | null>(
    null
  );

  // Form States for Adding Stock Entry
  const [newStockEntry, setNewStockEntry] = useState({
    partyName: "",
    dateReceived: "",
    stockItems: [
      {
        name: "",
        image: "",
        stockTypeId: 0,
        quantityType: "PACKET" as "PACKET" | "KG" | "LITER",
        totalQuantity: 0,
        totalWeight: 0,
        finalAmount: 0,
        status: "ACTIVE" as "ACTIVE" | "CONSUMED",
      },
    ],
  });

  // Form States for Editing Stock Entry
  const [editStockEntry, setEditStockEntry] = useState({
    partyName: "",
    dateReceived: "",
    stockItems: [] as {
      id: number;
      name: string;
      image: string;
      stockTypeId: number;
      quantityType: "PACKET" | "KG" | "LITER";
      totalQuantity: number;
      totalWeight: number;
      finalAmount: number;
      status: "ACTIVE" | "CONSUMED";
    }[],
  });

  // Form State for Adding Stock Type
  const [newStockTypeName, setNewStockTypeName] = useState("");

  // ----------------------------
  // Utility Functions
  // ----------------------------

  // Validate URL
  function isValidURL(string) {
    try {
      const url = new URL(string);
      // Define allowed domains
      const allowedDomains = []; // Add any domains you allow
      return allowedDomains.includes(url.hostname);
    } catch (error) {
      return false;
    }
  }

  // Type Guard for StockEntry
  function isValidStockEntry(entry: any): entry is StockEntry {
    return (
      typeof entry.id === "number" &&
      typeof entry.partyName === "string" &&
      typeof entry.dateReceived === "string" &&
      typeof entry.createdAt === "string" &&
      typeof entry.updatedAt === "string" &&
      Array.isArray(entry.stockItems) &&
      entry.stockItems.every(
        (item: any) =>
          typeof item.id === "number" &&
          typeof item.stockEntryId === "number" &&
          typeof item.stockItemId === "number" &&
          typeof item.stockItem === "object" &&
          typeof item.stockItem.id === "number" &&
          typeof item.stockItem.name === "string" &&
          typeof item.stockItem.stockTypeId === "number" &&
          ["PACKET", "KG", "LITER"].includes(item.stockItem.quantityType) &&
          typeof item.stockItem.totalQuantity === "number" &&
          (typeof item.stockItem.totalWeight === "number" ||
            item.stockItem.totalWeight === null) &&
          typeof item.stockItem.finalAmount === "number" &&
          ["ACTIVE", "CONSUMED"].includes(item.stockItem.status)
      )
    );
  }

  // ----------------------------
  // Data Fetching
  // ----------------------------

  useEffect(() => {
    fetchStockEntries();
    fetchStockTypes();
  }, []);

  // Fetch All Stock Entries
  const fetchStockEntries = async () => {
    setStockEntriesLoading(true);
    setStockEntriesError(null);
    try {
      const res = await fetch("/api/stock/entries", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`Error fetching stock entries: ${res.statusText}`);
      }

      const data: any[] = await res.json();
      const validEntries: StockEntry[] = data.filter(isValidStockEntry);
      setStockEntries(validEntries);
    } catch (error: any) {
      setStockEntriesError(error.message);
    } finally {
      setStockEntriesLoading(false);
    }
  };

  // Fetch All Stock Types
  const fetchStockTypes = async () => {
    setStockTypesLoading(true);
    setStockTypesError(null);
    try {
      const res = await fetch("/api/stock/types", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`Error fetching stock types: ${res.statusText}`);
      }

      const data: StockType[] = await res.json();
      setStockTypes(data);

      // Set options for react-select
      const options = data.map((type) => ({
        value: type.id,
        label: type.name,
      }));
      setStockTypeOptions(options);
    } catch (error: any) {
      setStockTypesError(error.message);
    } finally {
      setStockTypesLoading(false);
    }
  };

  // ----------------------------
  // Handler Functions
  // ----------------------------

  // Open Add Stock Entry Modal
  const handleAddStockEntry = () => {
    setNewStockEntry({
      partyName: "",
      dateReceived: "",
      stockItems: [
        {
          name: "",
          image: "",
          stockTypeId: 0,
          quantityType: "PACKET",
          totalQuantity: 0,
          totalWeight: 0,
          finalAmount: 0,
          status: "ACTIVE",
        },
      ],
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Stock Entry Modal
  const handleEditStockEntry = (entry: StockEntry) => {
    setSelectedStockEntry(entry);
    setEditStockEntry({
      partyName: entry.partyName,
      dateReceived: entry.dateReceived.split("T")[0], // Extract YYYY-MM-DD
      stockItems: entry.stockItems.map((item) => ({
        id: item.stockItemId, // Assuming stockItemId is unique
        name: item.stockItem.name,
        image: item.stockItem.image || "",
        stockTypeId: item.stockItem.stockTypeId,
        quantityType: item.stockItem.quantityType,
        totalQuantity: item.stockItem.totalQuantity,
        totalWeight: item.stockItem.totalWeight || 0,
        finalAmount: item.stockItem.finalAmount,
        status: item.stockItem.status,
      })),
    });
    setIsEditModalOpen(true);
  };

  // Delete Stock Entry
  const handleDeleteStockEntry = async (entryId: number) => {
    if (!confirm("Are you sure you want to delete this stock entry?")) {
      return;
    }

    try {
      const res = await fetch(`/api/stock/entries/${entryId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete stock entry.");
      }

      setStockEntries(stockEntries.filter((entry) => entry.id !== entryId));
      toast.success("Stock entry deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting stock entry:", error);
      toast.error(error.message);
    }
  };

  // Submit Add Stock Entry Form
  const submitAddStockEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (!newStockEntry.partyName.trim() || !newStockEntry.dateReceived) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Validate stock items
    for (let i = 0; i < newStockEntry.stockItems.length; i++) {
      const item = newStockEntry.stockItems[i];
      if (!item.name.trim()) {
        toast.error(`Stock Item ${i + 1}: Name is required.`);
        return;
      }
      if (!item.stockTypeId) {
        toast.error(`Stock Item ${i + 1}: Stock Type is required.`);
        return;
      }
      if (item.quantityType === "KG" || item.quantityType === "LITER") {
        if (!item.totalWeight || item.totalWeight <= 0) {
          toast.error(
            `Stock Item ${i + 1}: Total Weight must be a positive number.`
          );
          return;
        }
      }
      if (item.finalAmount < 0) {
        toast.error(`Stock Item ${i + 1}: Final Amount cannot be negative.`);
        return;
      }
      if (item.image && !isValidURL(item.image)) {
        toast.error(
          `Stock Item ${i + 1}: Please provide a valid image URL.`
        );
        return;
      }
    }

    try {
      // First, create all stock items
      const stockItemIds: number[] = [];
      for (const item of newStockEntry.stockItems) {
        const res = await fetch("/api/stock/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: item.name,
            image: item.image || "",
            stockTypeId: item.stockTypeId,
            quantityType: item.quantityType,
            totalQuantity: item.totalQuantity,
            totalWeight:
              item.quantityType === "PACKET" ? null : item.totalWeight,
            finalAmount: item.finalAmount,
            status: item.status,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to create stock item.");
        }

        const createdItem: StockItemDetails = await res.json();
        stockItemIds.push(createdItem.id);
      }

      // Then, create the stock entry
      const stockEntryRes = await fetch("/api/stock/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partyName: newStockEntry.partyName,
          dateReceived: newStockEntry.dateReceived,
          stockItemIds: stockItemIds,
        }),
      });

      if (!stockEntryRes.ok) {
        const errorData = await stockEntryRes.json();
        throw new Error(errorData.error || "Failed to create stock entry.");
      }

      const createdEntry: StockEntry = await stockEntryRes.json();
      setStockEntries([...stockEntries, createdEntry]);
      setIsAddModalOpen(false);
      toast.success("Stock entry created successfully!");
    } catch (error: any) {
      console.error("Error creating stock entry:", error);
      toast.error(error.message);
    }
  };

  // Submit Edit Stock Entry Form
  const submitEditStockEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submission initiated.");
    
    console.log("Selected Stock Entry:", selectedStockEntry);
    console.log("Edit Stock Entry Data:", editStockEntry);
  
    if (!selectedStockEntry) {
      console.error("No selected stock entry found. Aborting submission.");
      toast.error("No stock entry selected for editing.");
      return;
    }
  
    // Basic form validation
    if (!editStockEntry.partyName.trim() || !editStockEntry.dateReceived) {
      console.error("Validation failed: Party Name or Date Received is missing.");
      toast.error("Please fill in all required fields.");
      return;
    }
  
    // Validate stock items
    for (let i = 0; i < editStockEntry.stockItems.length; i++) {
      const item = editStockEntry.stockItems[i];
      console.log(`Validating Stock Item ${i + 1}:`, item);
  
      if (!item.name.trim()) {
        console.error(`Validation failed: Stock Item ${i + 1} - Name is required.`);
        toast.error(`Stock Item ${i + 1}: Name is required.`);
        return;
      }
      if (!item.stockTypeId) {
        console.error(`Validation failed: Stock Item ${i + 1} - Stock Type is required.`);
        toast.error(`Stock Item ${i + 1}: Stock Type is required.`);
        return;
      }
      if (item.quantityType === "KG" || item.quantityType === "LITER") {
        if (!item.totalWeight || item.totalWeight <= 0) {
          console.error(`Validation failed: Stock Item ${i + 1} - Total Weight must be a positive number.`);
          toast.error(`Stock Item ${i + 1}: Total Weight must be a positive number.`);
          return;
        }
      }
      if (item.finalAmount < 0) {
        console.error(`Validation failed: Stock Item ${i + 1} - Final Amount cannot be negative.`);
        toast.error(`Stock Item ${i + 1}: Final Amount cannot be negative.`);
        return;
      }
      if (item.image && !isValidURL(item.image)) {
        console.error(`Validation failed: Stock Item ${i + 1} - Invalid Image URL.`);
        toast.error(`Stock Item ${i + 1}: Please provide a valid image URL.`);
        
      }
    }
  
    try {
      console.log("Starting to update/create stock items...");
      
      // First, update all stock items
      const updatedStockItemIds: number[] = [];
      for (const [index, item] of editStockEntry.stockItems.entries()) {
        console.log(`Processing Stock Item ${index + 1}:`, item);
        
        let response;
        if (item.id && item.id !== 0) {
          console.log(`Updating existing Stock Item ID: ${item.id}`);
          // Existing stock item, update it
          response = await fetch(`/api/stock/items/${item.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: item.name,
              image: item.image || "",
              stockTypeId: item.stockTypeId,
              quantityType: item.quantityType,
              totalQuantity: item.totalQuantity,
              totalWeight:
                item.quantityType === "PACKET" ? null : item.totalWeight,
              finalAmount: item.finalAmount,
              status: item.status,
            }),
          });
        } else {
          console.log(`Creating new Stock Item.`);
          // New stock item, create it
          response = await fetch("/api/stock/items", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: item.name,
              image: item.image || "",
              stockTypeId: item.stockTypeId,
              quantityType: item.quantityType,
              totalQuantity: item.totalQuantity,
              totalWeight:
                item.quantityType === "PACKET" ? null : item.totalWeight,
              finalAmount: item.finalAmount,
              status: item.status,
            }),
          });
        }
  
        console.log(`Fetch response status for Stock Item ${index + 1}:`, response.status);
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error processing Stock Item ${index + 1}:`, errorData);
          throw new Error(errorData.error || "Failed to process stock item.");
        }
  
        const processedItem: StockItemDetails = await response.json();
        console.log(`Successfully processed Stock Item ${index + 1}:`, processedItem);
        updatedStockItemIds.push(processedItem.id);
      }
  
      console.log("All stock items processed successfully. Proceeding to update the stock entry.");
  
      // Then, update the stock entry
      const stockEntryRes = await fetch(
        `/api/stock/entries/${selectedStockEntry.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            partyName: editStockEntry.partyName,
            dateReceived: editStockEntry.dateReceived,
            stockItemIds: updatedStockItemIds,
          }),
        }
      );
  
      console.log(`Fetch response status for Stock Entry update:`, stockEntryRes.status);
  
      if (!stockEntryRes.ok) {
        const errorData = await stockEntryRes.json();
        console.error("Error updating stock entry:", errorData);
        throw new Error(errorData.error || "Failed to update stock entry.");
      }
  
      const updatedEntry: StockEntry = await stockEntryRes.json();
      console.log("Stock entry updated successfully:", updatedEntry);
  
      // Update the local state with the updated entry
      setStockEntries(
        stockEntries.map((entry) =>
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
  
      console.log("Local stock entries state updated.");
  
      // Close the edit modal
      setIsEditModalOpen(false);
      console.log("Edit modal closed.");
  
      // Notify the user of success
      toast.success("Stock entry updated successfully!");
    } catch (error: any) {
      console.error("Error during stock entry update process:", error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  };
  
  // Add New Stock Item Field (Add Modal)
  const addNewStockItemField = () => {
    setNewStockEntry((prev) => ({
      ...prev,
      stockItems: [
        ...prev.stockItems,
        {
          name: "",
          image: "",
          stockTypeId: 0,
          quantityType: "PACKET",
          totalQuantity: 0,
          totalWeight: 0,
          finalAmount: 0,
          status: "ACTIVE",
        },
      ],
    }));
  };

  // Remove Stock Item Field (Add Modal)
  const removeStockItemField = (index: number) => {
    setNewStockEntry((prev) => ({
      ...prev,
      stockItems: prev.stockItems.filter((_, i) => i !== index),
    }));
  };

  // Handle Stock Item Change (Add Modal)
  const handleNewStockItemChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updatedStockItems = [...newStockEntry.stockItems];
    updatedStockItems[index] = { ...updatedStockItems[index], [field]: value };
    setNewStockEntry({ ...newStockEntry, stockItems: updatedStockItems });
  };

  // Add New Stock Item Field (Edit Modal)
  const addEditStockItemField = () => {
    setEditStockEntry((prev) => ({
      ...prev,
      stockItems: [
        ...prev.stockItems,
        {
          id: 0,
          name: "",
          image: "",
          stockTypeId: 0,
          quantityType: "PACKET",
          totalQuantity: 0,
          totalWeight: 0,
          finalAmount: 0,
          status: "ACTIVE",
        },
      ],
    }));
  };

  // Remove Stock Item Field (Edit Modal)
  const removeEditStockItemField = (index: number) => {
    setEditStockEntry((prev) => ({
      ...prev,
      stockItems: prev.stockItems.filter((_, i) => i !== index),
    }));
  };

  // Handle Stock Item Change (Edit Modal)
  const handleEditStockItemChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updatedStockItems = [...editStockEntry.stockItems];
    updatedStockItems[index] = { ...updatedStockItems[index], [field]: value };
    setEditStockEntry({ ...editStockEntry, stockItems: updatedStockItems });
  };

  // Open Stock Items Modal
  const handleViewStockItems = (items: StockItemDetails[]) => {
    setSelectedStockItems(items);
    setIsStockItemsModalOpen(true);
  };

  // Open Edit Stock Item Modal
  const handleEditStockItem = (item: StockItemDetails) => {
    setStockItemToEdit(item);
    setIsEditStockItemModalOpen(true);
  };

  // Delete Stock Item
  const handleDeleteStockItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this stock item?")) {
      return;
    }

    try {
      const res = await fetch(`/api/stock/items/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete stock item.");
      }

      // Remove the deleted item from the selectedStockItems state
      setSelectedStockItems(
        selectedStockItems.filter((item) => item.id !== itemId)
      );

      // Also update the main stockEntries state
      setStockEntries((prevEntries) =>
        prevEntries.map((entry) => {
          if (entry.stockItems.some((si) => si.stockItemId === itemId)) {
            return {
              ...entry,
              stockItems: entry.stockItems.filter(
                (si) => si.stockItemId !== itemId
              ),
            };
          }
          return entry;
        })
      );

      toast.success("Stock item deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting stock item:", error);
      toast.error(error.message);
    }
  };

  // Submit Edit Stock Item Form
  const submitEditStockItem = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submitEditStockItem called");
  
    if (!stockItemToEdit) {
      console.error("No stockItemToEdit found. Exiting function.");
      return;
    }
  
    console.log("stockItemToEdit:", stockItemToEdit);
  
    // Basic form validation
    if (!stockItemToEdit.name.trim()) {
      console.error("Validation failed: Stock Item Name is empty.");
      toast.error("Stock Item Name is required.");
      return;
    }
    console.log("Validation passed: Stock Item Name is present.");
  
    if (!stockItemToEdit.stockTypeId) {
      console.error("Validation failed: Stock Type ID is missing.");
      toast.error("Stock Type is required.");
      return;
    }
    console.log("Validation passed: Stock Type ID is present.");
  
    if (
      stockItemToEdit.quantityType === "KG" ||
      stockItemToEdit.quantityType === "LITER"
    ) {
      console.log(
        `Quantity Type is ${stockItemToEdit.quantityType}, checking totalWeight.`
      );
      if (!stockItemToEdit.totalWeight || stockItemToEdit.totalWeight <= 0) {
        console.error("Validation failed: Total Weight is invalid.");
        toast.error("Total Weight must be a positive number.");
        return;
      }
      console.log("Validation passed: Total Weight is valid.");
    }
  
    if (stockItemToEdit.finalAmount < 0) {
      console.error("Validation failed: Final Amount is negative.");
      toast.error("Final Amount cannot be negative.");
      return;
    }
    console.log("Validation passed: Final Amount is non-negative.");
  
    if (stockItemToEdit.image && !isValidURL(stockItemToEdit.image)) {
      console.error("Validation failed: Image URL is invalid.");
      toast.error("Please provide a valid image URL.");
      // return;
    }
    console.log("Validation passed: Image URL is valid or not provided.");
  
    try {
      const requestBody = {
        name: stockItemToEdit.name,
        image: stockItemToEdit.image || "",
        stockTypeId: stockItemToEdit.stockTypeId,
        quantityType: stockItemToEdit.quantityType,
        totalQuantity: stockItemToEdit.totalQuantity,
        totalWeight:
          stockItemToEdit.quantityType === "PACKET"
            ? null
            : stockItemToEdit.totalWeight,
        finalAmount: stockItemToEdit.finalAmount,
        status: stockItemToEdit.status,
      };
  
      console.log("Sending PUT request to /api/stock/items/", stockItemToEdit.id);
      console.log("Request body:", requestBody);
  
      const res = await fetch(`/api/stock/items/${stockItemToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      console.log("Received response:", res);
  
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API response not OK:", errorData);
        throw new Error(errorData.error || "Failed to update stock item.");
      }
  
      const updatedItem: StockItemDetails = await res.json();
      console.log("Updated stock item received from API:", updatedItem);
  
      // Update the selectedStockItems state
      setSelectedStockItems((prevItems) => {
        const updatedSelectedItems = prevItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        );
        console.log("Updated selectedStockItems:", updatedSelectedItems);
        return updatedSelectedItems;
      });
  
      // Also update the main stockEntries state
      setStockEntries((prevEntries) => {
        const updatedStockEntries = prevEntries.map((entry) => {
          const updatedStockItems = entry.stockItems.map((si) =>
            si.stockItemId === updatedItem.id
              ? { ...si, stockItem: updatedItem }
              : si
          );
          return { ...entry, stockItems: updatedStockItems };
        });
        console.log("Updated stockEntries:", updatedStockEntries);
        return updatedStockEntries;
      });
  
      toast.success("Stock item updated successfully!");
      console.log("Stock item updated successfully, closing modal.");
      setIsEditStockItemModalOpen(false);
      setStockItemToEdit(null);
    } catch (error: any) {
      console.error("Error updating stock item:", error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  };
  

  // Open Add Stock Type Modal
  const handleAddStockType = () => {
    setNewStockTypeName("");
    setIsAddStockTypeModalOpen(true);
  };

  // Submit Add Stock Type Form
  const submitAddStockType = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStockTypeName.trim()) {
      toast.error("Stock Type Name cannot be empty.");
      return;
    }

    try {
      const res = await fetch("/api/stock/types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newStockTypeName }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add stock type.");
      }

      const createdStockType: StockType = await res.json();

      // Update stockTypes state
      setStockTypes((prevTypes) => [...prevTypes, createdStockType]);

      // Update react-select options
      setStockTypeOptions((prevOptions) => [
        ...prevOptions,
        { value: createdStockType.id, label: createdStockType.name },
      ]);

      toast.success("Stock type added successfully!");
      setIsAddStockTypeModalOpen(false);
    } catch (error: any) {
      console.error("Error adding stock type:", error);
      toast.error(error.message);
    }
  };

  // ----------------------------
  // DataTable Columns Definition
  // ----------------------------

  const stockEntryColumns: ColumnDef<StockEntry>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => row.getValue("id"),
    },
    {
      accessorKey: "partyName",
      header: "Party Name",
      cell: ({ row }) => row.getValue("partyName"),
    },
    {
      accessorKey: "dateReceived",
      header: "Date Received",
      cell: ({ row }) => {
        const date = new Date(row.getValue("dateReceived"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "stockItems",
      header: "Stock Items",
      cell: ({ row }) => {
        const stockItems = row.getValue<StockEntry["stockItems"]>("stockItems");
        if (Array.isArray(stockItems) && stockItems.length > 0) {
          const count = stockItems.length;
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleViewStockItems(stockItems.map((item) => item.stockItem))
              }
            >
              View Items ({count})
            </Button>
          );
        }
        return "No Items";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const entry = row.original;
        return (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="bg-white shadow-md rounded-md p-1">
              <DropdownMenu.Item
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                onSelect={() => handleEditStockEntry(entry)}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer text-red-500"
                onSelect={() => handleDeleteStockEntry(entry.id)}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        );
      },
    },
  ];

  const activeItems = useMemo(
    () => selectedStockItems.filter(item => item.status === "ACTIVE"),
    [selectedStockItems]
  );

  const consumedItems = useMemo(
    () => selectedStockItems.filter(item => item.status === "CONSUMED"),
    [selectedStockItems]
  );
  // ----------------------------
  // JSX Rendering
  // ----------------------------

  return (

    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Stock Entries Management</h1>
      {(stockEntriesError || stockTypesError) && (
        <div className="text-red-500 mb-4">
          Error: {stockEntriesError || stockTypesError}
        </div>
      )}

      

      {/* DataTable for Stock Entries */}
      <DataTable
        columns={stockEntryColumns}
        data={stockEntries}
        onPrimaryButton={handleAddStockEntry}
        primaryButtonText="Stock Entry"
        onSecondaryButton={handleAddStockType}
        secondaryButtonText="Stock Type"
        pageSize={10} // Adjust as needed
      />

      {/* Modal for Viewing Stock Items */}
      
    <Modal
      isOpen={isStockItemsModalOpen}
      onClose={() => setIsStockItemsModalOpen(false)}
      aria-labelledby="stock-items-title" // Enhances accessibility
    >
      {/* Modal Container with Fixed Height and Flex Layout */}
      <div className="h-[80vh] w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg flex flex-col p-4">
        
        {/* Modal Header */}
        <div className="mb-6">
          <h2 id="stock-items-title" className="text-2xl font-bold text-gray-800">
            Stock Items Details
          </h2>
        </div>
        
        {/* Tabs Section */}
        {selectedStockItems.length > 0 ? (
          <Tabs defaultValue="active" className="flex-1 flex flex-col">
            
            {/* Tabs List */}
            <TabsList className="mb-4 flex space-x-4 border-b">
              <TabsTrigger value="active" className="text-lg">
                Active ({activeItems.length})
              </TabsTrigger>
              <TabsTrigger value="consumed" className="text-lg">
                Consumed ({consumedItems.length})
              </TabsTrigger>
            </TabsList>
            
            {/* Active Stock Items */}
            <TabsContent value="active" className="flex-1 overflow-y-auto">
              {activeItems.length > 0 ? (
                <div className="space-y-6">
                  {activeItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-300 p-6 rounded-md flex items-center shadow-md"
                    >
                      {/* Validate the image URL before rendering the Image component */}
                      {item.image && isValidURL(item.image) ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="mr-4 object-cover rounded-full border border-gray-300"
                        />
                      ) : (
                        // Placeholder for invalid or missing image URLs
                        <div className="w-15 h-15 mr-4 bg-gray-200 flex items-center justify-center rounded-full border border-gray-300">
                          No Image
                        </div>
                      )}
  
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-700">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity Type: {item.quantityType}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Quantity: {item.totalQuantity}
                        </p>
                        {item.quantityType !== "PACKET" && (
                          <p className="text-sm text-gray-600">
                            Total Weight: {item.totalWeight}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Final Amount: ${item.finalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Status: {item.status}</p>
                      </div>
  
                      {/* Edit and Delete Buttons */}
                      <div className="flex flex-col space-y-2 items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStockItem(item)}
                          className="flex items-center"
                        >
                          <EditIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 flex items-center"
                          onClick={() => handleDeleteStockItem(item.id)}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </Button> */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center mt-4">No Active Stock Items Available.</p>
              )}
            </TabsContent>
    
            {/* Consumed Stock Items */}
            <TabsContent value="consumed" className="flex-1 overflow-y-auto">
              {consumedItems.length > 0 ? (
                <div className="space-y-6">
                  {consumedItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-300 p-6 rounded-md flex items-center shadow-md"
                    >
                      {/* Validate the image URL before rendering the Image component */}
                      {item.image && isValidURL(item.image) ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="mr-4 object-cover rounded-full border border-gray-300"
                        />
                      ) : (
                        // Placeholder for invalid or missing image URLs
                        <div className="w-15 h-15 mr-4 bg-gray-200 flex items-center justify-center rounded-full border border-gray-300">
                          No Image
                        </div>
                      )}
  
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-700">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity Type: {item.quantityType}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Quantity: {item.totalQuantity}
                        </p>
                        {item.quantityType !== "PACKET" && (
                          <p className="text-sm text-gray-600">
                            Total Weight: {item.totalWeight}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Final Amount: ${item.finalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Status: {item.status}</p>
                      </div>
  
                      {/* Edit and Delete Buttons */}
                      <div className="flex flex-col space-y-2 items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStockItem(item)}
                          className="flex items-center mr-3"
                        >
                          <EditIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 flex items-center"
                          onClick={() => handleDeleteStockItem(item.id)}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center mt-4">No Consumed Stock Items Available.</p>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-gray-600 text-center mt-4">No Stock Items Available.</p>
        )}
      </div>
    </Modal>

      {/* Modal for Editing a Specific Stock Item */}
      <Modal
        isOpen={isEditStockItemModalOpen}
        onClose={() => {
          setIsEditStockItemModalOpen(false);
          setStockItemToEdit(null);
        }}
      >
        <div className="max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Edit Stock Item</h2>
          {stockItemToEdit && (
            <form onSubmit={submitEditStockItem} className="space-y-4">
              {/* Name Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-name-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <Input
                  id={`edit-stock-item-name-${stockItemToEdit.id}`}
                  type="text"
                  value={stockItemToEdit.name}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Image Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-image-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Image URL
                </label>
                <Input
                  id={`edit-stock-item-image-${stockItemToEdit.id}`}
                  type="url"
                  value={stockItemToEdit.image}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      image: e.target.value,
                    })
                  }
                  placeholder="Enter image URL"
                />
              </div>

              {/* Stock Type Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-stockType-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Stock Type
                </label>
                <Select
                  id={`edit-stock-item-stockType-${stockItemToEdit.id}`}
                  options={stockTypeOptions}
                  value={
                    stockItemToEdit.stockTypeId
                      ? stockTypeOptions.find(
                          (opt) => opt.value === stockItemToEdit.stockTypeId
                        )
                      : null
                  }
                  onChange={(selected) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      stockTypeId: selected ? selected.value : 0,
                    })
                  }
                  isClearable
                  placeholder="-- Select Stock Type --"
                  classNamePrefix="react-select"
                  required
                />
              </div>

              {/* Quantity Type Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-quantityType-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Quantity Type
                </label>
                <select
                  id={`edit-stock-item-quantityType-${stockItemToEdit.id}`}
                  value={stockItemToEdit.quantityType}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      quantityType: e.target.value as "PACKET" | "KG" | "LITER",
                    })
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="PACKET">PACKET</option>
                  <option value="KG">KG</option>
                  <option value="LITER">LITER</option>
                </select>
              </div>

              {/* Total Quantity Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-totalQuantity-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Total Quantity
                </label>
                <Input
                  id={`edit-stock-item-totalQuantity-${stockItemToEdit.id}`}
                  type="number"
                  value={stockItemToEdit.totalQuantity}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      totalQuantity: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>

              {/* Total Weight Field (Conditional) */}
              {(stockItemToEdit.quantityType === "KG" ||
                stockItemToEdit.quantityType === "LITER") && (
                <div>
                  <label
                    htmlFor={`edit-stock-item-totalWeight-${stockItemToEdit.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Total Weight
                  </label>
                  <Input
                    id={`edit-stock-item-totalWeight-${stockItemToEdit.id}`}
                    type="number"
                    step="0.01"
                    value={stockItemToEdit.totalWeight}
                    onChange={(e) =>
                      setStockItemToEdit({
                        ...stockItemToEdit,
                        totalWeight: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              )}

              {/* Final Amount Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-finalAmount-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Final Amount ($)
                </label>
                <Input
                  id={`edit-stock-item-finalAmount-${stockItemToEdit.id}`}
                  type="number"
                  step="0.01"
                  value={stockItemToEdit.finalAmount}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      finalAmount: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              {/* Status Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-status-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id={`edit-stock-item-status-${stockItemToEdit.id}`}
                  value={stockItemToEdit.status}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      status: e.target.value as "ACTIVE" | "CONSUMED",
                    })
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="CONSUMED">CONSUMED</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit">Update Stock Item</Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
          {/* Modal for Adding Stock Type */}
          <Modal
  isOpen={isAddStockTypeModalOpen}
  onClose={() => setIsAddStockTypeModalOpen(false)}
>
  <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">New Stock Type</h2>
    <form onSubmit={submitAddStockType} className="space-y-6">
      {/* Stock Type Name Field */}
      <div className="space-y-2">
        <label
          htmlFor="stockTypeName"
          className="block text-sm font-medium text-gray-700"
        >
          Stock Type Name
        </label>
        <Input
          id="stockTypeName"
          type="text"
          value={newStockTypeName}
          onChange={(e) => setNewStockTypeName(e.target.value)}
          placeholder="Enter stock type name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          variant="secondary" // Shadcn primary variant
          className="ml w-full sm:w-auto"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Stock Type
        </Button>
      </div>
    </form>
  </div>
</Modal>



      {/* Modal for Adding Stock Entry */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <div className="max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Add Stock Entry</h2>
          <form onSubmit={submitAddStockEntry} className="space-y-4">
            {/* Party Name Field */}
            <div>
              <label
                htmlFor="partyName"
                className="block text-sm font-medium text-gray-700"
              >
                Party Name
              </label>
              <Input
                id="partyName"
                type="text"
                value={newStockEntry.partyName}
                onChange={(e) =>
                  setNewStockEntry({
                    ...newStockEntry,
                    partyName: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Date Received Field */}
            <div>
              <label
                htmlFor="dateReceived"
                className="block text-sm font-medium text-gray-700"
              >
                Date Received
              </label>
              <Input
                id="dateReceived"
                type="date"
                value={newStockEntry.dateReceived}
                onChange={(e) =>
                  setNewStockEntry({
                    ...newStockEntry,
                    dateReceived: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Stock Items Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">Stock Items</h3>
              {newStockEntry.stockItems.map((item, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-md mb-4 relative"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {newStockEntry.stockItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStockItemField(index)}
                        className="absolute top-2 right-2"
                        aria-label="Remove Stock Item"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {/* Name Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`new-stock-item-name-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <Input
                      id={`new-stock-item-name-${index}`}
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleNewStockItemChange(index, "name", e.target.value)
                      }
                      required
                    />
                  </div>
                  {/* Image Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`new-stock-item-image-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Image URL
                    </label>
                    <Input
                      id={`new-stock-item-image-${index}`}
                      type="url"
                      value={item.image}
                      onChange={(e) =>
                        handleNewStockItemChange(index, "image", e.target.value)
                      }
                      placeholder="Enter image URL or sample name"
                    />
                  </div>
                  {/* Stock Type Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`new-stock-item-stockType-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Stock Type
                    </label>
                    <Select
                      id={`new-stock-item-stockType-${index}`}
                      options={stockTypeOptions}
                      value={
                        item.stockTypeId
                          ? stockTypeOptions.find(
                              (opt) => opt.value === item.stockTypeId
                            )
                          : null
                      }
                      onChange={(selected) =>
                        handleNewStockItemChange(
                          index,
                          "stockTypeId",
                          selected ? selected.value : 0
                        )
                      }
                      isClearable
                      placeholder="-- Select Stock Type --"
                      classNamePrefix="react-select"
                      required
                    />
                  </div>
                  {/* Quantity Type Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`new-stock-item-quantityType-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Quantity Type
                    </label>
                    <select
                      id={`new-stock-item-quantityType-${index}`}
                      value={item.quantityType}
                      onChange={(e) =>
                        handleNewStockItemChange(
                          index,
                          "quantityType",
                          e.target.value
                        )
                      }
                      className="w-full border rounded px-2 py-1"
                      required
                    >
                      <option value="PACKET">PACKET</option>
                      <option value="KG">KG</option>
                      <option value="LITER">LITER</option>
                    </select>
                  </div>
                  {/* Total Quantity Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`new-stock-item-totalQuantity-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Total Quantity
                    </label>
                    <Input
                      id={`new-stock-item-totalQuantity-${index}`}
                      type="number"
                      value={item.totalQuantity}
                      onChange={(e) =>
                        handleNewStockItemChange(
                          index,
                          "totalQuantity",
                          parseInt(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  {/* Total Weight Field (Conditional) */}
                  {(item.quantityType === "KG" ||
                    item.quantityType === "LITER") && (
                    <div className="mb-2">
                      <label
                        htmlFor={`new-stock-item-totalWeight-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Total Weight
                      </label>
                      <Input
                        id={`new-stock-item-totalWeight-${index}`}
                        type="number"
                        step="0.01"
                        value={item.totalWeight}
                        onChange={(e) =>
                          handleNewStockItemChange(
                            index,
                            "totalWeight",
                            parseFloat(e.target.value)
                          )
                        }
                        required
                      />
                    </div>
                  )}
                  {/* Final Amount Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`new-stock-item-finalAmount-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Final Amount ($)
                    </label>
                    <Input
                      id={`new-stock-item-finalAmount-${index}`}
                      type="number"
                      step="0.01"
                      value={item.finalAmount}
                      onChange={(e) =>
                        handleNewStockItemChange(
                          index,
                          "finalAmount",
                          parseFloat(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  {/* Status Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`new-stock-item-status-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Status
                    </label>
                    <select
                      id={`new-stock-item-status-${index}`}
                      value={item.status}
                      onChange={(e) =>
                        handleNewStockItemChange(
                          index,
                          "status",
                          e.target.value
                        )
                      }
                      className="w-full border rounded px-2 py-1"
                      required
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="CONSUMED">CONSUMED</option>
                    </select>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={addNewStockItemField}
                variant="secondary"
                className="mt-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Another Stock Item
              </Button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mr-10">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal for Editing a Stock Entry */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Edit Stock Entry</h2>
          <form onSubmit={submitEditStockEntry} className="space-y-4">
            {/* Party Name Field */}
            <div>
              <label
                htmlFor="edit-partyName"
                className="block text-sm font-medium text-gray-700"
              >
                Party Name
              </label>
              <Input
                id="edit-partyName"
                type="text"
                value={editStockEntry.partyName}
                onChange={(e) =>
                  setEditStockEntry({
                    ...editStockEntry,
                    partyName: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Date Received Field */}
            <div>
              <label
                htmlFor="edit-dateReceived"
                className="block text-sm font-medium text-gray-700"
              >
                Date Received
              </label>
              <Input
                id="edit-dateReceived"
                type="date"
                value={editStockEntry.dateReceived}
                onChange={(e) =>
                  setEditStockEntry({
                    ...editStockEntry,
                    dateReceived: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Stock Items Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">Stock Items</h3>
              {editStockEntry.stockItems.map((item, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-md mb-4 relative"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {editStockEntry.stockItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEditStockItemField(index)}
                        className="absolute top-2 right-2"
                        aria-label="Remove Stock Item"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {/* Name Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`edit-stock-item-name-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <Input
                      id={`edit-stock-item-name-${index}`}
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleEditStockItemChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  {/* Image Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`edit-stock-item-image-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Image URL
                    </label>
                    <Input
                      id={`edit-stock-item-image-${index}`}
                      type="url"
                      value={item.image}
                      onChange={(e) =>
                        handleEditStockItemChange(
                          index,
                          "image",
                          e.target.value
                        )
                      }
                      placeholder="Enter image URL or sample name"
                    />
                  </div>
                  {/* Stock Type Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`edit-stock-item-stockType-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Stock Type
                    </label>
                    <Select
                      id={`edit-stock-item-stockType-${index}`}
                      options={stockTypeOptions}
                      value={
                        item.stockTypeId
                          ? stockTypeOptions.find(
                              (opt) => opt.value === item.stockTypeId
                            )
                          : null
                      }
                      onChange={(selected) =>
                        handleEditStockItemChange(
                          index,
                          "stockTypeId",
                          selected ? selected.value : 0
                        )
                      }
                      isClearable
                      placeholder="-- Select Stock Type --"
                      classNamePrefix="react-select"
                      required
                    />
                  </div>
                  {/* Quantity Type Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`edit-stock-item-quantityType-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Quantity Type
                    </label>
                    <select
                      id={`edit-stock-item-quantityType-${index}`}
                      value={item.quantityType}
                      onChange={(e) =>
                        handleEditStockItemChange(
                          index,
                          "quantityType",
                          e.target.value
                        )
                      }
                      className="w-full border rounded px-2 py-1"
                      required
                    >
                      <option value="PACKET">PACKET</option>
                      <option value="KG">KG</option>
                      <option value="LITER">LITER</option>
                    </select>
                  </div>
                  {/* Total Quantity Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`edit-stock-item-totalQuantity-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Total Quantity
                    </label>
                    <Input
                      id={`edit-stock-item-totalQuantity-${index}`}
                      type="number"
                      value={item.totalQuantity}
                      onChange={(e) =>
                        handleEditStockItemChange(
                          index,
                          "totalQuantity",
                          parseInt(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  {/* Total Weight Field (Conditional) */}
                  {(item.quantityType === "KG" ||
                    item.quantityType === "LITER") && (
                    <div className="mb-2">
                      <label
                        htmlFor={`edit-stock-item-totalWeight-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Total Weight
                      </label>
                      <Input
                        id={`edit-stock-item-totalWeight-${index}`}
                        type="number"
                        step="0.01"
                        value={item.totalWeight}
                        onChange={(e) =>
                          handleEditStockItemChange(
                            index,
                            "totalWeight",
                            parseFloat(e.target.value)
                          )
                        }
                        required
                      />
                    </div>
                  )}
                  {/* Final Amount Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`edit-stock-item-finalAmount-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Final Amount ($)
                    </label>
                    <Input
                      id={`edit-stock-item-finalAmount-${index}`}
                      type="number"
                      step="0.01"
                      value={item.finalAmount}
                      onChange={(e) =>
                        handleEditStockItemChange(
                          index,
                          "finalAmount",
                          parseFloat(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  {/* Status Field */}
                  <div className="mb-2">
                    <label
                      htmlFor={`edit-stock-item-status-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Status
                    </label>
                    <select
                      id={`edit-stock-item-status-${index}`}
                      value={item.status}
                      onChange={(e) =>
                        handleEditStockItemChange(
                          index,
                          "status",
                          e.target.value
                        )
                      }
                      className="w-full border rounded px-2 py-1"
                      required
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="CONSUMED">CONSUMED</option>
                    </select>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={addEditStockItemField}
                variant="secondary"
                className="mt-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Another Stock Item
              </Button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit">Update Stock Entry</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal for Editing a Specific Stock Item */}
      <Modal
        isOpen={isEditStockItemModalOpen}
        onClose={() => {
          setIsEditStockItemModalOpen(false);
          setStockItemToEdit(null);
        }}
      >
        <div className="max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Edit Stock Item</h2>
          {stockItemToEdit && (
            <form onSubmit={submitEditStockItem} className="space-y-4">
              {/* Name Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-name-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <Input
                  id={`edit-stock-item-name-${stockItemToEdit.id}`}
                  type="text"
                  value={stockItemToEdit.name}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Image Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-image-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Image URL
                </label>
                <Input
                  id={`edit-stock-item-image-${stockItemToEdit.id}`}
                  type="url"
                  value={stockItemToEdit.image}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      image: e.target.value,
                    })
                  }
                  placeholder="Enter image URL"
                />
              </div>

              {/* Stock Type Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-stockType-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Stock Type
                </label>
                <Select
                  id={`edit-stock-item-stockType-${stockItemToEdit.id}`}
                  options={stockTypeOptions}
                  value={
                    stockItemToEdit.stockTypeId
                      ? stockTypeOptions.find(
                          (opt) => opt.value === stockItemToEdit.stockTypeId
                        )
                      : null
                  }
                  onChange={(selected) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      stockTypeId: selected ? selected.value : 0,
                    })
                  }
                  isClearable
                  placeholder="-- Select Stock Type --"
                  classNamePrefix="react-select"
                  required
                />
              </div>

              {/* Quantity Type Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-quantityType-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Quantity Type
                </label>
                <select
                  id={`edit-stock-item-quantityType-${stockItemToEdit.id}`}
                  value={stockItemToEdit.quantityType}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      quantityType: e.target.value as
                        | "PACKET"
                        | "KG"
                        | "LITER",
                    })
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="PACKET">PACKET</option>
                  <option value="KG">KG</option>
                  <option value="LITER">LITER</option>
                </select>
              </div>

              {/* Total Quantity Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-totalQuantity-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Total Quantity
                </label>
                <Input
                  id={`edit-stock-item-totalQuantity-${stockItemToEdit.id}`}
                  type="number"
                  value={stockItemToEdit.totalQuantity}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      totalQuantity: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>

              {/* Total Weight Field (Conditional) */}
              {(stockItemToEdit.quantityType === "KG" ||
                stockItemToEdit.quantityType === "LITER") && (
                <div>
                  <label
                    htmlFor={`edit-stock-item-totalWeight-${stockItemToEdit.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Total Weight
                  </label>
                  <Input
                    id={`edit-stock-item-totalWeight-${stockItemToEdit.id}`}
                    type="number"
                    step="0.01"
                    value={stockItemToEdit.totalWeight}
                    onChange={(e) =>
                      setStockItemToEdit({
                        ...stockItemToEdit,
                        totalWeight: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              )}

              {/* Final Amount Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-finalAmount-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Final Amount ($)
                </label>
                <Input
                  id={`edit-stock-item-finalAmount-${stockItemToEdit.id}`}
                  type="number"
                  step="0.01"
                  value={stockItemToEdit.finalAmount}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      finalAmount: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              {/* Status Field */}
              <div>
                <label
                  htmlFor={`edit-stock-item-status-${stockItemToEdit.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id={`edit-stock-item-status-${stockItemToEdit.id}`}
                  value={stockItemToEdit.status}
                  onChange={(e) =>
                    setStockItemToEdit({
                      ...stockItemToEdit,
                      status: e.target.value as "ACTIVE" | "CONSUMED",
                    })
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="CONSUMED">CONSUMED</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit">Update Stock Item</Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    
    </div>

        
  );
 
}
