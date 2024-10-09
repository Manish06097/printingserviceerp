// src/app/jobs/page.tsx

"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontalIcon, EditIcon, TrashIcon, DownloadIcon } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function JobsPage() {
  // Interfaces
  interface Job {
    id: number;
    jobName: string;
    partyId: number;
    party: Party;
    jobType: string;
    boardSize: string;
    plateSize: string;
    images: string[]; // URLs or paths to images
    color: string;
    dripOff?: boolean;
    varnish?: boolean;
    lamination?: boolean;
    micro?: boolean;
    punching?: boolean;
    uv?: boolean;
    window?: boolean;
    foil?: boolean;
    scodix?: boolean;
    pasting?: boolean;
    totalQuantity?: number;
    jobStatus: JobStatus;
    createdAt: string;
    updatedAt: string;
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
  }

  type JobStatus = "INCOMPLETE" | "PENDING" | "ONGOING" | "COMPLETED";

  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Form states for adding a new job
  const [newJob, setNewJob] = useState({
    jobName: "",
    partyId: "",
    jobType: "",
    boardSize: "",
    plateSize: "",
    images: null as FileList | null,
    color: "1C1SP" as string,
    dripOff: "no",
    varnish: "no",
    lamination: "no",
    micro: "no",
    punching: "no",
    uv: "no",
    window: "no",
    foil: "no",
    scodix: "no",
    pasting: "no",
    totalQuantity: "",
    jobStatus: "INCOMPLETE" as JobStatus,
  });

  // Form states for editing an existing job
  const [editJob, setEditJob] = useState({
    jobName: "",
    partyId: "",
    jobType: "",
    boardSize: "",
    plateSize: "",
    images: null as FileList | null,
    color: "1C1SP" as string,
    dripOff: "no",
    varnish: "no",
    lamination: "no",
    micro: "no",
    punching: "no",
    uv: "no",
    window: "no",
    foil: "no",
    scodix: "no",
    pasting: "no",
    totalQuantity: "",
    jobStatus: "INCOMPLETE" as JobStatus,
  });

  useEffect(() => {
    fetchJobs();
    fetchParties();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs.");
      const data = await res.json();
      setJobs(data);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await fetch("/api/parties");
      if (!res.ok) throw new Error("Failed to fetch parties.");
      const data = await res.json();
      setParties(data);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleAddJob = () => setIsAddModalOpen(true);

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setEditJob({
      jobName: job.jobName,
      partyId: job.partyId.toString(),
      jobType: job.jobType,
      boardSize: job.boardSize,
      plateSize: job.plateSize,
      images: null,
      color: job.color,
      dripOff: job.dripOff ? "yes" : "no",
      varnish: job.varnish ? "yes" : "no",
      lamination: job.lamination ? "yes" : "no",
      micro: job.micro ? "yes" : "no",
      punching: job.punching ? "yes" : "no",
      uv: job.uv ? "yes" : "no",
      window: job.window ? "yes" : "no",
      foil: job.foil ? "yes" : "no",
      scodix: job.scodix ? "yes" : "no",
      pasting: job.pasting ? "yes" : "no",
      totalQuantity: job.totalQuantity?.toString() || "",
      jobStatus: job.jobStatus,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteJob = async (job: Job) => {
    if (!confirm(`Are you sure you want to delete job "${job.jobName}"?`)) return;
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete job.");
      }
      setJobs(jobs.filter((j) => j.id !== job.id));
      toast.success("Job deleted successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (!newJob.jobName || !newJob.partyId || !newJob.jobType || !newJob.color || !newJob.images) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("jobName", newJob.jobName);
      formData.append("partyId", newJob.partyId);
      formData.append("jobType", newJob.jobType);
      formData.append("boardSize", newJob.boardSize);
      formData.append("plateSize", newJob.plateSize);
      formData.append("color", newJob.color);
      formData.append("dripOff", newJob.dripOff);
      formData.append("varnish", newJob.varnish);
      formData.append("lamination", newJob.lamination);
      formData.append("micro", newJob.micro);
      formData.append("punching", newJob.punching);
      formData.append("uv", newJob.uv);
      formData.append("window", newJob.window);
      formData.append("foil", newJob.foil);
      formData.append("scodix", newJob.scodix);
      formData.append("pasting", newJob.pasting);
      formData.append("totalQuantity", newJob.totalQuantity);
      formData.append("jobStatus", newJob.jobStatus);

      // Append images
      if (newJob.images) {
        Array.from(newJob.images).forEach((image) => {
          formData.append("images", image);
        });
      }

      const res = await axios.post("/api/jobs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const createdJob: Job = res.data;
      setJobs([...jobs, createdJob]);
      setIsAddModalOpen(false);
      setNewJob({
        jobName: "",
        partyId: "",
        jobType: "",
        boardSize: "",
        plateSize: "",
        images: null,
        color: "1C1SP",
        dripOff: "no",
        varnish: "no",
        lamination: "no",
        micro: "no",
        punching: "no",
        uv: "no",
        window: "no",
        foil: "no",
        scodix: "no",
        pasting: "no",
        totalQuantity: "",
        jobStatus: "INCOMPLETE",
      });
      toast.success("Job created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message);
    }
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJob) return;

    // Basic form validation
    if (!editJob.jobName || !editJob.partyId || !editJob.jobType || !editJob.color) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("jobName", editJob.jobName);
      formData.append("partyId", editJob.partyId);
      formData.append("jobType", editJob.jobType);
      formData.append("boardSize", editJob.boardSize);
      formData.append("plateSize", editJob.plateSize);
      formData.append("color", editJob.color);
      formData.append("dripOff", editJob.dripOff);
      formData.append("varnish", editJob.varnish);
      formData.append("lamination", editJob.lamination);
      formData.append("micro", editJob.micro);
      formData.append("punching", editJob.punching);
      formData.append("uv", editJob.uv);
      formData.append("window", editJob.window);
      formData.append("foil", editJob.foil);
      formData.append("scodix", editJob.scodix);
      formData.append("pasting", editJob.pasting);
      formData.append("totalQuantity", editJob.totalQuantity);
      formData.append("jobStatus", editJob.jobStatus);

      // Append images if any
      if (editJob.images) {
        Array.from(editJob.images).forEach((image) => {
          formData.append("images", image);
        });
      }

      const res = await axios.put(`/api/jobs/${selectedJob.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedJob: Job = res.data;
      setJobs(jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
      setIsEditModalOpen(false);
      setSelectedJob(null);
      toast.success("Job updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message);
    }
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedJob(null);
    setError(null);
  };

  const columns: ColumnDef<Job>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "jobName", header: "Job Name" },
    {
      accessorKey: "party.name",
      header: "Party Name",
      cell: ({ row }) => row.original.party?.name || "N/A",
    },
    { accessorKey: "jobType", header: "Job Type" },
    { accessorKey: "boardSize", header: "Board Size" },
    { accessorKey: "plateSize", header: "Plate Size" },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => row.original.color.replace("printCharge", ""),
    },
    {
      accessorKey: "jobStatus",
      header: "Job Status",
      cell: ({ row }) => row.original.jobStatus,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original;

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
                onSelect={() => handleEditJob(job)}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                onSelect={() => handleDeleteJob(job)}
              >
                <TrashIcon className="h-4 w-4 mr-2 text-red-500" />
                Delete
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                onSelect={() => handleDownloadPDF(job)}
              >
                <DownloadIcon className="h-4 w-4 mr-2 text-blue-500" />
                Download PDF
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        );
      },
    },
  ];

  const handleDownloadPDF = async (job: Job) => {
    // Implement PDF generation logic here
    // For example, you can use jsPDF or another library to create PDFs on the client side
    toast.info("PDF download functionality is not yet implemented.");
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 pb-2 shadow-sm">
        Job Management
      </h1>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddJob}>Add Job</Button>
      </div>
      <DataTable columns={columns} data={jobs} pageSize={10} />

      {/* Modal for Adding New Job */}
      <Modal isOpen={isAddModalOpen} name={"Add Job"} onClose={handleCloseModals}>
        <div className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleAddFormSubmit} className="space-y-4">
            {/* Job Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Name*</label>
              <Input
                type="text"
                value={newJob.jobName}
                onChange={(e) => setNewJob({ ...newJob, jobName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Party Name*</label>
              <select
                value={newJob.partyId}
                onChange={(e) => setNewJob({ ...newJob, partyId: e.target.value })}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="">Select Party</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Type*</label>
              <Input
                type="text"
                value={newJob.jobType}
                onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Board Size*</label>
              <Input
                type="text"
                value={newJob.boardSize}
                onChange={(e) => setNewJob({ ...newJob, boardSize: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Plate Size*</label>
              <Input
                type="text"
                value={newJob.plateSize}
                onChange={(e) => setNewJob({ ...newJob, plateSize: e.target.value })}
                required
              />
            </div>
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Images*</label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setNewJob({ ...newJob, images: e.target.files })}
                required
              />
            </div>
            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Color*</label>
              <select
                value={newJob.color}
                onChange={(e) => setNewJob({ ...newJob, color: e.target.value })}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="1C1SP">1C1SP</option>
                <option value="2C">2C</option>
                <option value="3C1SP">3C1SP</option>
                <option value="4C">4C</option>
                <option value="5C">5C</option>
                <option value="3SP">3SP</option>
                <option value="4SP">4SP</option>
                <option value="2SP">2SP</option>
              </select>
            </div>

            {/* Printing Options */}
            <h2 className="text-xl font-semibold mt-6">Printing Options</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">DripOff</label>
                <select
                  value={newJob.dripOff}
                  onChange={(e) => setNewJob({ ...newJob, dripOff: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Varnish</label>
                <select
                  value={newJob.varnish}
                  onChange={(e) => setNewJob({ ...newJob, varnish: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lamination</label>
                <select
                  value={newJob.lamination}
                  onChange={(e) => setNewJob({ ...newJob, lamination: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Micro</label>
                <select
                  value={newJob.micro}
                  onChange={(e) => setNewJob({ ...newJob, micro: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Punching</label>
                <select
                  value={newJob.punching}
                  onChange={(e) => setNewJob({ ...newJob, punching: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">UV</label>
                <select
                  value={newJob.uv}
                  onChange={(e) => setNewJob({ ...newJob, uv: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Window</label>
                <select
                  value={newJob.window}
                  onChange={(e) => setNewJob({ ...newJob, window: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Foil</label>
                <select
                  value={newJob.foil}
                  onChange={(e) => setNewJob({ ...newJob, foil: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Scodix</label>
                <select
                  value={newJob.scodix}
                  onChange={(e) => setNewJob({ ...newJob, scodix: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pasting</label>
                <select
                  value={newJob.pasting}
                  onChange={(e) => setNewJob({ ...newJob, pasting: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            {/* Total Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Quantity</label>
              <Input
                type="number"
                value={newJob.totalQuantity}
                onChange={(e) => setNewJob({ ...newJob, totalQuantity: e.target.value })}
              />
            </div>

            {/* Job Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Status</label>
              <select
                value={newJob.jobStatus}
                onChange={(e) => setNewJob({ ...newJob, jobStatus: e.target.value as JobStatus })}
                className="w-full border rounded px-2 py-1"
              >
                <option value="INCOMPLETE">Incomplete</option>
                <option value="PENDING">Pending</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit">Add Job</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal for Editing Job */}
      {selectedJob && (
        <Modal isOpen={isEditModalOpen} name={"Edit Job"} onClose={handleCloseModals}>
          <div className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              {/* Job Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Name*</label>
                <Input
                  type="text"
                  value={editJob.jobName}
                  onChange={(e) => setEditJob({ ...editJob, jobName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Party Name*</label>
                <select
                  value={editJob.partyId}
                  onChange={(e) => setEditJob({ ...editJob, partyId: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Select Party</option>
                  {parties.map((party) => (
                    <option key={party.id} value={party.id}>
                      {party.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Type*</label>
                <Input
                  type="text"
                  value={editJob.jobType}
                  onChange={(e) => setEditJob({ ...editJob, jobType: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Board Size*</label>
                <Input
                  type="text"
                  value={editJob.boardSize}
                  onChange={(e) => setEditJob({ ...editJob, boardSize: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Plate Size*</label>
                <Input
                  type="text"
                  value={editJob.plateSize}
                  onChange={(e) => setEditJob({ ...editJob, plateSize: e.target.value })}
                  required
                />
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Images</label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setEditJob({ ...editJob, images: e.target.files })}
                />
                <p className="text-sm text-gray-500">Leave empty to keep existing images.</p>
              </div>
              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Color*</label>
                <select
                  value={editJob.color}
                  onChange={(e) => setEditJob({ ...editJob, color: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="1C1SP">1C1SP</option>
                  <option value="2C">2C</option>
                  <option value="3C1SP">3C1SP</option>
                  <option value="4C">4C</option>
                  <option value="5C">5C</option>
                  <option value="3SP">3SP</option>
                  <option value="4SP">4SP</option>
                  <option value="2SP">2SP</option>
                </select>
              </div>

              {/* Printing Options */}
              <h2 className="text-xl font-semibold mt-6">Printing Options</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">DripOff</label>
                  <select
                    value={editJob.dripOff}
                    onChange={(e) => setEditJob({ ...editJob, dripOff: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Varnish</label>
                  <select
                    value={editJob.varnish}
                    onChange={(e) => setEditJob({ ...editJob, varnish: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lamination</label>
                  <select
                    value={editJob.lamination}
                    onChange={(e) => setEditJob({ ...editJob, lamination: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Micro</label>
                  <select
                    value={editJob.micro}
                    onChange={(e) => setEditJob({ ...editJob, micro: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Punching</label>
                  <select
                    value={editJob.punching}
                    onChange={(e) => setEditJob({ ...editJob, punching: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">UV</label>
                  <select
                    value={editJob.uv}
                    onChange={(e) => setEditJob({ ...editJob, uv: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Window</label>
                  <select
                    value={editJob.window}
                    onChange={(e) => setEditJob({ ...editJob, window: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Foil</label>
                  <select
                    value={editJob.foil}
                    onChange={(e) => setEditJob({ ...editJob, foil: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Scodix</label>
                  <select
                    value={editJob.scodix}
                    onChange={(e) => setEditJob({ ...editJob, scodix: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pasting</label>
                  <select
                    value={editJob.pasting}
                    onChange={(e) => setEditJob({ ...editJob, pasting: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Total Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <Input
                  type="number"
                  value={editJob.totalQuantity}
                  onChange={(e) => setEditJob({ ...editJob, totalQuantity: e.target.value })}
                />
              </div>

              {/* Job Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Status</label>
                <select
                  value={editJob.jobStatus}
                  onChange={(e) => setEditJob({ ...editJob, jobStatus: e.target.value as JobStatus })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="INCOMPLETE">Incomplete</option>
                  <option value="PENDING">Pending</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit">Update Job</Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      </div>
    }

    