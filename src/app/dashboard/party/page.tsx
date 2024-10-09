// app/parties/page.tsx

"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontalIcon, EditIcon, TrashIcon } from "lucide-react";
import { toast } from "react-toastify";

// TypeScript Interfaces
interface JobWorkRateDetails {
  printCharge1C1SP?: number;
  printCharge2C?: number;
  printCharge3C1SP?: number;
  printCharge4C?: number;
  printCharge5C?: number;
  printCharge3SP?: number;
  printCharge4SP?: number;
  printCharge2SP?: number;
  dropOffRate?: number;
  varnishRate?: number;
  laminationRateSqInch?: number;
  pateAdd?: number;
  pateLess?: number;
  minSheetsPerColorChange?: number;
  microRate?: number;
  punchingRate?: number;
  uvRate?: number;
  windowRate?: number;
  foilRate?: number;
  scodixRate?: number;
  pastingRate?: number;
}

interface Party {
  id: number;
  name: string;
  shortCode: string;
  partyCompanyName: string;
  phoneNumber: string;
  address?: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
  jobWorkRateDetails?: JobWorkRateDetails;
}

export default function PartiesPage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  // Form states for adding a new party
  const [newParty, setNewParty] = useState<{
    name: string;
    shortCode: string;
    partyCompanyName: string;
    phoneNumber: string;
    address: string;
    reference: string;
    jobWorkRateDetails: JobWorkRateDetails;
  }>({
    name: "",
    shortCode: "",
    partyCompanyName: "",
    phoneNumber: "",
    address: "",
    reference: "",
    jobWorkRateDetails: {
      printCharge1C1SP: undefined,
      printCharge2C: undefined,
      printCharge3C1SP: undefined,
      printCharge4C: undefined,
      printCharge5C: undefined,
      printCharge3SP: undefined,
      printCharge4SP: undefined,
      printCharge2SP: undefined,
      dropOffRate: undefined,
      varnishRate: undefined,
      laminationRateSqInch: undefined,
      pateAdd: undefined,
      pateLess: undefined,
      minSheetsPerColorChange: undefined,
      microRate: undefined,
      punchingRate: undefined,
      uvRate: undefined,
      windowRate: undefined,
      foilRate: undefined,
      scodixRate: undefined,
      pastingRate: undefined,
    },
  });

  // Form states for editing an existing party
  const [editParty, setEditParty] = useState<{
    name: string;
    shortCode: string;
    partyCompanyName: string;
    phoneNumber: string;
    address: string;
    reference: string;
    jobWorkRateDetails: JobWorkRateDetails;
  }>({
    name: "",
    shortCode: "",
    partyCompanyName: "",
    phoneNumber: "",
    address: "",
    reference: "",
    jobWorkRateDetails: {
      printCharge1C1SP: undefined,
      printCharge2C: undefined,
      printCharge3C1SP: undefined,
      printCharge4C: undefined,
      printCharge5C: undefined,
      printCharge3SP: undefined,
      printCharge4SP: undefined,
      printCharge2SP: undefined,
      dropOffRate: undefined,
      varnishRate: undefined,
      laminationRateSqInch: undefined,
      pateAdd: undefined,
      pateLess: undefined,
      minSheetsPerColorChange: undefined,
      microRate: undefined,
      punchingRate: undefined,
      uvRate: undefined,
      windowRate: undefined,
      foilRate: undefined,
      scodixRate: undefined,
      pastingRate: undefined,
    },
  });

  useEffect(() => {
    fetchParties();
  }, []);

  // Fetch all parties
  const fetchParties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parties");
      if (!res.ok) throw new Error("Failed to fetch parties.");
      const data: Party[] = await res.json();
      setParties(data);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the Add Party modal
  const handleAddParty = () => setIsAddModalOpen(true);

  // Handle opening the Edit Party modal
  const handleEditParty = (party: Party) => {
    setSelectedParty(party);
    setEditParty({
      name: party.name,
      shortCode: party.shortCode,
      partyCompanyName: party.partyCompanyName,
      phoneNumber: party.phoneNumber,
      address: party.address || "",
      reference: party.reference || "",
      jobWorkRateDetails: {
        printCharge1C1SP: party.jobWorkRateDetails?.printCharge1C1SP,
        printCharge2C: party.jobWorkRateDetails?.printCharge2C,
        printCharge3C1SP: party.jobWorkRateDetails?.printCharge3C1SP,
        printCharge4C: party.jobWorkRateDetails?.printCharge4C,
        printCharge5C: party.jobWorkRateDetails?.printCharge5C,
        printCharge3SP: party.jobWorkRateDetails?.printCharge3SP,
        printCharge4SP: party.jobWorkRateDetails?.printCharge4SP,
        printCharge2SP: party.jobWorkRateDetails?.printCharge2SP,
        dropOffRate: party.jobWorkRateDetails?.dropOffRate,
        varnishRate: party.jobWorkRateDetails?.varnishRate,
        laminationRateSqInch: party.jobWorkRateDetails?.laminationRateSqInch,
        pateAdd: party.jobWorkRateDetails?.pateAdd,
        pateLess: party.jobWorkRateDetails?.pateLess,
        minSheetsPerColorChange: party.jobWorkRateDetails?.minSheetsPerColorChange,
        microRate: party.jobWorkRateDetails?.microRate,
        punchingRate: party.jobWorkRateDetails?.punchingRate,
        uvRate: party.jobWorkRateDetails?.uvRate,
        windowRate: party.jobWorkRateDetails?.windowRate,
        foilRate: party.jobWorkRateDetails?.foilRate,
        scodixRate: party.jobWorkRateDetails?.scodixRate,
        pastingRate: party.jobWorkRateDetails?.pastingRate,
      },
    });
    setIsEditModalOpen(true);
  };

  // Handle deleting a party
  const handleDeleteParty = async (party: Party) => {
    if (!confirm(`Are you sure you want to delete party "${party.name}"?`)) return;
    try {
      const res = await fetch(`/api/parties/${party.id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete party.");
      }
      setParties(parties.filter((p) => p.id !== party.id));
      toast.success("Party deleted successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle form submission for adding a new party
  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (!newParty.name || !newParty.shortCode || !newParty.phoneNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newParty.name,
          shortCode: newParty.shortCode,
          partyCompanyName: newParty.partyCompanyName,
          phoneNumber: newParty.phoneNumber,
          address: newParty.address,
          reference: newParty.reference,
          jobWorkRateDetails: {
            printCharge1C1SP: newParty.jobWorkRateDetails.printCharge1C1SP,
            printCharge2C: newParty.jobWorkRateDetails.printCharge2C,
            printCharge3C1SP: newParty.jobWorkRateDetails.printCharge3C1SP,
            printCharge4C: newParty.jobWorkRateDetails.printCharge4C,
            printCharge5C: newParty.jobWorkRateDetails.printCharge5C,
            printCharge3SP: newParty.jobWorkRateDetails.printCharge3SP,
            printCharge4SP: newParty.jobWorkRateDetails.printCharge4SP,
            printCharge2SP: newParty.jobWorkRateDetails.printCharge2SP,
            dropOffRate: newParty.jobWorkRateDetails.dropOffRate,
            varnishRate: newParty.jobWorkRateDetails.varnishRate,
            laminationRateSqInch: newParty.jobWorkRateDetails.laminationRateSqInch,
            pateAdd: newParty.jobWorkRateDetails.pateAdd,
            pateLess: newParty.jobWorkRateDetails.pateLess,
            minSheetsPerColorChange: newParty.jobWorkRateDetails.minSheetsPerColorChange,
            microRate: newParty.jobWorkRateDetails.microRate,
            punchingRate: newParty.jobWorkRateDetails.punchingRate,
            uvRate: newParty.jobWorkRateDetails.uvRate,
            windowRate: newParty.jobWorkRateDetails.windowRate,
            foilRate: newParty.jobWorkRateDetails.foilRate,
            scodixRate: newParty.jobWorkRateDetails.scodixRate,
            pastingRate: newParty.jobWorkRateDetails.pastingRate,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create party.");
      }

      const createdParty: Party = await res.json();
      setParties([...parties, createdParty]);
      setIsAddModalOpen(false);
      setNewParty({
        name: "",
        shortCode: "",
        partyCompanyName: "",
        phoneNumber: "",
        address: "",
        reference: "",
        jobWorkRateDetails: {
          printCharge1C1SP: undefined,
          printCharge2C: undefined,
          printCharge3C1SP: undefined,
          printCharge4C: undefined,
          printCharge5C: undefined,
          printCharge3SP: undefined,
          printCharge4SP: undefined,
          printCharge2SP: undefined,
          dropOffRate: undefined,
          varnishRate: undefined,
          laminationRateSqInch: undefined,
          pateAdd: undefined,
          pateLess: undefined,
          minSheetsPerColorChange: undefined,
          microRate: undefined,
          punchingRate: undefined,
          uvRate: undefined,
          windowRate: undefined,
          foilRate: undefined,
          scodixRate: undefined,
          pastingRate: undefined,
        },
      });
      toast.success("Party created successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle form submission for editing an existing party
  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedParty) return;

    // Basic form validation
    if (!editParty.name || !editParty.shortCode || !editParty.phoneNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch(`/api/parties/${selectedParty.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editParty.name,
          shortCode: editParty.shortCode,
          partyCompanyName: editParty.partyCompanyName,
          phoneNumber: editParty.phoneNumber,
          address: editParty.address,
          reference: editParty.reference,
          jobWorkRateDetails: {
            printCharge1C1SP: editParty.jobWorkRateDetails.printCharge1C1SP,
            printCharge2C: editParty.jobWorkRateDetails.printCharge2C,
            printCharge3C1SP: editParty.jobWorkRateDetails.printCharge3C1SP,
            printCharge4C: editParty.jobWorkRateDetails.printCharge4C,
            printCharge5C: editParty.jobWorkRateDetails.printCharge5C,
            printCharge3SP: editParty.jobWorkRateDetails.printCharge3SP,
            printCharge4SP: editParty.jobWorkRateDetails.printCharge4SP,
            printCharge2SP: editParty.jobWorkRateDetails.printCharge2SP,
            dropOffRate: editParty.jobWorkRateDetails.dropOffRate,
            varnishRate: editParty.jobWorkRateDetails.varnishRate,
            laminationRateSqInch: editParty.jobWorkRateDetails.laminationRateSqInch,
            pateAdd: editParty.jobWorkRateDetails.pateAdd,
            pateLess: editParty.jobWorkRateDetails.pateLess,
            minSheetsPerColorChange: editParty.jobWorkRateDetails.minSheetsPerColorChange,
            microRate: editParty.jobWorkRateDetails.microRate,
            punchingRate: editParty.jobWorkRateDetails.punchingRate,
            uvRate: editParty.jobWorkRateDetails.uvRate,
            windowRate: editParty.jobWorkRateDetails.windowRate,
            foilRate: editParty.jobWorkRateDetails.foilRate,
            scodixRate: editParty.jobWorkRateDetails.scodixRate,
            pastingRate: editParty.jobWorkRateDetails.pastingRate,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update party.");
      }

      const updatedParty: Party = await res.json();
      setParties(parties.map((p) => (p.id === updatedParty.id ? updatedParty : p)));
      setIsEditModalOpen(false);
      setSelectedParty(null);
      toast.success("Party updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle closing modals
  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedParty(null);
    setError(null);
  };

  // Define columns for the DataTable, including all JobWorkRateDetails fields
  const columns: ColumnDef<Party>[] = [
    { accessorKey: "id", header: "ID" ,size:200},
    { accessorKey: "name", header: "Name" },
    { accessorKey: "shortCode", header: "Short Code" },
    { accessorKey: "partyCompanyName", header: "Company Name" },
    { accessorKey: "phoneNumber", header: "Phone Number" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "reference", header: "Reference" },
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
    // Job Work Rate Details Columns
    {
      accessorKey: "jobWorkRateDetails.printCharge1C1SP",
      header: "Print Charge 1C1SP",
      size:200,
      cell: ({ row }) =>
        row.original.jobWorkRateDetails?.printCharge1C1SP ?? "N/A",
    },
    {
      accessorKey: "jobWorkRateDetails.printCharge2C",
      header: "Print Charge 2C",
      size:200,
      cell: ({ row }) =>
        row.original.jobWorkRateDetails?.printCharge2C ?? "N/A",
    },
    {
      accessorKey: "jobWorkRateDetails.printCharge3C1SP",
      header: "Print Charge 3C1SP",
      cell: ({ row }) =>
        row.original.jobWorkRateDetails?.printCharge3C1SP ?? "N/A",
    },
    {
      accessorKey: "jobWorkRateDetails.printCharge4C",
      header: "Print Charge 4C",
      cell: ({ row }) =>
        row.original.jobWorkRateDetails?.printCharge4C ?? "N/A",
    },
    {
      accessorKey: "jobWorkRateDetails.printCharge5C",
      header: "Print Charge 5C",
      cell: ({ row }) =>
        row.original.jobWorkRateDetails?.printCharge5C ?? "N/A",
    },
    // {
    //   accessorKey: "jobWorkRateDetails.printCharge3SP",
    //   header: "Print Charge 3SP",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.printCharge3SP ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.printCharge4SP",
    //   header: "Print Charge 4SP",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.printCharge4SP ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.printCharge2SP",
    //   header: "Print Charge 2SP",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.printCharge2SP ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.dropOffRate",
    //   header: "Drop Off Rate",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.dropOffRate ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.varnishRate",
    //   header: "Varnish Rate",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.varnishRate ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.laminationRateSqInch",
    //   header: "Lamination Rate/Sq Inch",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.laminationRateSqInch ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.pateAdd",
    //   header: "Pate Add",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.pateAdd ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.pateLess",
    //   header: "Pate Less",
    //   size:200,
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.pateLess ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.minSheetsPerColorChange",
    //   header: "Min Sheets/Color Change",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.minSheetsPerColorChange ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.microRate",
    //   header: "Micro Rate",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.microRate ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.punchingRate",
    //   header: "Punching Rate",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.punchingRate ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.uvRate",
    //   header: "UV Rate",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.uvRate ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.windowRate",
    //   header: "Window Rate",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.windowRate ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.foilRate",
    //   header: "Foil Rate",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.foilRate ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.scodixRate",
    //   header: "Scodix Rate",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.scodixRate ?? "N/A",
    // },
    // {
    //   accessorKey: "jobWorkRateDetails.pastingRate",
    //   header: "Pasting Rate",
    //   cell: ({ row }) =>
    //     row.original.jobWorkRateDetails?.pastingRate ?? "N/A",
    // },
    // // Actions Column
    // {
    //   id: "actions",
    //   header: "Actions",
    //   cell: ({ row }) => {
    //     const party = row.original;

    //     return (
    //       <DropdownMenu.Root>
    //         <DropdownMenu.Trigger asChild>
    //           <Button variant="ghost" size="sm">
    //             <MoreHorizontalIcon className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenu.Trigger>
    //         <DropdownMenu.Content className="bg-white shadow-md rounded-md p-1">
    //           <DropdownMenu.Item
    //             className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
    //             onSelect={() => handleEditParty(party)}
    //           >
    //             <EditIcon className="h-4 w-4 mr-2" />
    //             Edit
    //           </DropdownMenu.Item>
    //           <DropdownMenu.Item
    //             className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
    //             onSelect={() => handleDeleteParty(party)}
    //           >
    //             <TrashIcon className="h-4 w-4 mr-2 text-red-500" />
    //             Delete
    //           </DropdownMenu.Item>
    //         </DropdownMenu.Content>
    //       </DropdownMenu.Root>
    //     );
    //   },
    // },
  ];

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 pb-2 shadow-sm">
        Party Management
      </h1>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      {/* <div className="flex justify-end mb-4">
        <Button onClick={handleAddParty}>Add Party</Button>
      </div> */}


      <div className="overflow-x-auto">
  <div className="min-w-full">
    <DataTable columns={columns} primaryButtonText="Add Party" onPrimaryButton={handleAddParty} data={parties} pageSize={10} />
  </div>
</div>


      {/* Modal for Adding New Party */}
      <Modal isOpen={isAddModalOpen} name={"Add Party"} onClose={handleCloseModals}>
        <div className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleAddFormSubmit} className="space-y-4">
            {/* Party Details */}
            <h2 className="text-xl font-semibold">Party Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name*</label>
              <Input
                type="text"
                value={newParty.name}
                onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Short Code*</label>
              <Input
                type="text"
                value={newParty.shortCode}
                onChange={(e) => setNewParty({ ...newParty, shortCode: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name*</label>
              <Input
                type="text"
                value={newParty.partyCompanyName}
                onChange={(e) =>
                  setNewParty({ ...newParty, partyCompanyName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number*</label>
              <Input
                type="text"
                value={newParty.phoneNumber}
                onChange={(e) =>
                  setNewParty({ ...newParty, phoneNumber: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <Input
                type="text"
                value={newParty.address}
                onChange={(e) =>
                  setNewParty({ ...newParty, address: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference</label>
              <Input
                type="text"
                value={newParty.reference}
                onChange={(e) =>
                  setNewParty({ ...newParty, reference: e.target.value })
                }
              />
            </div>

            {/* Job Work Rate Details */}
            <h2 className="text-xl font-semibold mt-6">Job Work Rate Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Print Charges */}
              <div>
                <label className="block text-sm font-medium text-gray-700">1C1SP</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.printCharge1C1SP ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        printCharge1C1SP: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">2C</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.printCharge2C ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        printCharge2C: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">3C1SP</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.printCharge3C1SP ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        printCharge3C1SP: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">4C</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.printCharge4C ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        printCharge4C: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">5C</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.printCharge5C ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        printCharge5C: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">3SP</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.printCharge3SP ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        printCharge3SP: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">4SP</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.printCharge4SP ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        printCharge4SP: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">2SP</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.printCharge2SP ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        printCharge2SP: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
            </div>

            {/* Additional Job Work Rates */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Drop Off Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.dropOffRate ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        dropOffRate: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Varnish Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.varnishRate ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        varnishRate: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lamination Rate/Sq Inch
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.laminationRateSqInch ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        laminationRateSqInch: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pate Add</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.pateAdd ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        pateAdd: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pate Less</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.pateLess ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        pateLess: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Sheets/Color Change
                </label>
                <Input
                  type="number"
                  value={newParty.jobWorkRateDetails.minSheetsPerColorChange ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        minSheetsPerColorChange: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Micro Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.microRate ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        microRate: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Punching Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.punchingRate ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        punchingRate: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">UV Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.uvRate ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        uvRate: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Window Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.windowRate ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        windowRate: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Foil Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.foilRate ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        foilRate: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Scodix Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.scodixRate ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        scodixRate: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pasting Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newParty.jobWorkRateDetails.pastingRate ?? ""}
                  onChange={(e) =>
                    setNewParty({
                      ...newParty,
                      jobWorkRateDetails: {
                        ...newParty.jobWorkRateDetails,
                        pastingRate: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-4">
              <Button type="submit">Add Party</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal for Editing Party */}
      {selectedParty && (
        <Modal isOpen={isEditModalOpen} name={"Edit Party"} onClose={handleCloseModals}>
          <div className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              {/* Party Details */}
              <h2 className="text-xl font-semibold">Party Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name*</label>
                <Input
                  type="text"
                  value={editParty.name}
                  onChange={(e) => setEditParty({ ...editParty, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Short Code*</label>
                <Input
                  type="text"
                  value={editParty.shortCode}
                  onChange={(e) => setEditParty({ ...editParty, shortCode: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name*</label>
                <Input
                  type="text"
                  value={editParty.partyCompanyName}
                  onChange={(e) =>
                    setEditParty({ ...editParty, partyCompanyName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number*</label>
                <Input
                  type="text"
                  value={editParty.phoneNumber}
                  onChange={(e) =>
                    setEditParty({ ...editParty, phoneNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <Input
                  type="text"
                  value={editParty.address}
                  onChange={(e) =>
                    setEditParty({ ...editParty, address: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference</label>
                <Input
                  type="text"
                  value={editParty.reference}
                  onChange={(e) =>
                    setEditParty({ ...editParty, reference: e.target.value })
                  }
                />
              </div>

              {/* Job Work Rate Details */}
              <h2 className="text-xl font-semibold mt-6">Job Work Rate Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Print Charges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">1C1SP</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.printCharge1C1SP ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          printCharge1C1SP: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">2C</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.printCharge2C ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          printCharge2C: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">3C1SP</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.printCharge3C1SP ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          printCharge3C1SP: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">4C</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.printCharge4C ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          printCharge4C: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">5C</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.printCharge5C ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          printCharge5C: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">3SP</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.printCharge3SP ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          printCharge3SP: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">4SP</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.printCharge4SP ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          printCharge4SP: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">2SP</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.printCharge2SP ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          printCharge2SP: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Additional Job Work Rates */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Drop Off Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.dropOffRate ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          dropOffRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Varnish Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.varnishRate ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          varnishRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lamination Rate/Sq Inch
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.laminationRateSqInch ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          laminationRateSqInch: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pate Add</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.pateAdd ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          pateAdd: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pate Less</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.pateLess ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          pateLess: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Min Sheets/Color Change
                  </label>
                  <Input
                    type="number"
                    value={editParty.jobWorkRateDetails.minSheetsPerColorChange ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          minSheetsPerColorChange: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Micro Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.microRate ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          microRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Punching Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.punchingRate ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          punchingRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">UV Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.uvRate ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          uvRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Window Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.windowRate ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          windowRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Foil Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.foilRate ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          foilRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Scodix Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.scodixRate ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          scodixRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pasting Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editParty.jobWorkRateDetails.pastingRate ?? ""}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        jobWorkRateDetails: {
                          ...editParty.jobWorkRateDetails,
                          pastingRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-4">
                <Button type="submit">Update Party</Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
