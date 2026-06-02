import React, { useState } from "react";
import { Detail } from "@/components/admin/auditions/Detail";
import Link from "next/link";
import { ChevronDownIcon } from "@/components/ui/ChevronDownIcon";
import { ChevronUpIcon } from "@/components/ui/ChevronUpIcon";

type Registration = {
  id: string;
  full_name: string;
  roll_number: string;
  branch: string;
  year: string;
  phone_number: string;
  registration_type: "vocalist" | "instrumentalist";
  languages?: string;
  backing_track_links?: string;
  instruments?: string[];
  needs_instrument?: boolean;
  remarks?: string;
  submitted_at: string;
  synced_to_sheet: boolean;
  email: string;
};

type RegistrationsTableProps = {
  registrations: Registration[];
  expandedRow: string | null;
  yearColors: Record<number, string>;
  onToggleRow: (id: string) => void;
  // Added callback prop to connect with your Supabase insert function
  onAddToTeam: (
    registration: Registration,
    parsedYear: number,
  ) => Promise<void>;
};

// Helper to convert registration string year ("1st", "2nd") to database integer format (1, 2)
const parseYearToInteger = (yearStr: string): number => {
  const match = yearStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
};

export function RegistrationsTable({
  registrations,
  expandedRow,
  yearColors,
  onToggleRow,
  onAddToTeam,
}: RegistrationsTableProps) {
  // Track loading state for each button row using registration ID
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>(
    {},
  );

  const handleAddToTeamClick = async (
    e: React.MouseEvent,
    reg: Registration,
  ) => {
    e.stopPropagation(); // Stop row toggle event from firing

    setProcessingIds((prev) => ({ ...prev, [reg.id]: true }));
    try {
      const parsedYear = parseYearToInteger(reg.year);
      await onAddToTeam(reg, parsedYear);
    } catch (error) {
      console.error("Failed to add team member:", error);
    } finally {
      setProcessingIds((prev) => ({ ...prev, [reg.id]: false }));
    }
  };
  // 1. Updated sorting keys signature typing
  const [sortField, setSortField] = useState<
    "branch" | "year" | "submitted_at" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (field: "branch" | "year" | "submitted_at") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 2. Compute sorted array inclusive of timeline parsing
  const sortedRegistrations = [...registrations].sort((a, b) => {
    if (!sortField) return 0;

    // Handle Date comparison operations
    if (sortField === "submitted_at") {
      const timeA = new Date(a.submitted_at).getTime();
      const timeB = new Date(b.submitted_at).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    }

    // Handle Numerical Year comparisons
    if (sortField === "year") {
      return sortOrder === "asc"
        ? Number(a.year) - Number(b.year)
        : Number(b.year) - Number(a.year);
    }

    // Handle Alphabetical Branch comparisons
    const valA = a[sortField] ? String(a[sortField]).toLowerCase() : "";
    const valB = b[sortField] ? String(b[sortField]).toLowerCase() : "";

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden w-full overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth: 1100 }}>
        <thead className="bg-gray-800 text-gray-400 uppercase text-xs select-none">
          <tr>
            <th className="px-4 py-3 text-left w-6"></th>
            <th className="px-4 py-3 text-left">Name</th>

            {/* --- BRANCH HEADER WITH SORT BUTTON --- */}
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort("branch")}
                className="flex items-center gap-1 hover:text-white transition uppercase font-bold text-xs tracking-wider"
              >
                Branch
                <div className="flex flex-col -space-y-1 text-gray-500">
                  <ChevronUpIcon
                    size={12}
                    className={`transition ${sortField === "branch" && sortOrder === "asc" ? "text-indigo-400 font-black scale-110" : "opacity-40"}`}
                  />
                  <ChevronDownIcon
                    size={12}
                    className={`transition ${sortField === "branch" && sortOrder === "desc" ? "text-indigo-400 font-black scale-110" : "opacity-40"}`}
                  />
                </div>
              </button>
            </th>

            {/* --- YEAR HEADER WITH SORT BUTTON --- */}
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort("year")}
                className="flex items-center gap-1 hover:text-white transition uppercase font-bold text-xs tracking-wider"
              >
                Year
                <div className="flex flex-col -space-y-1 text-gray-500">
                  <ChevronUpIcon
                    size={12}
                    className={`transition ${sortField === "year" && sortOrder === "asc" ? "text-indigo-400 font-black scale-110" : "opacity-40"}`}
                  />
                  <ChevronDownIcon
                    size={12}
                    className={`transition ${sortField === "year" && sortOrder === "desc" ? "text-indigo-400 font-black scale-110" : "opacity-40"}`}
                  />
                </div>
              </button>
            </th>

            <th className="px-4 py-3 text-left">Phone</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Synced</th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort("submitted_at")}
                className="flex items-center gap-1 hover:text-white transition uppercase font-bold text-xs tracking-wider"
              >
                Date
                <div className="flex flex-col -space-y-1 text-gray-500">
                  <ChevronUpIcon
                    size={12}
                    className={`transition ${sortField === "submitted_at" && sortOrder === "asc" ? "text-indigo-400 font-black scale-110" : "opacity-40"}`}
                  />
                  <ChevronDownIcon
                    size={12}
                    className={`transition ${sortField === "submitted_at" && sortOrder === "desc" ? "text-indigo-400 font-black scale-110" : "opacity-40"}`}
                  />
                </div>
              </button>
            </th>
            <th className="px-4 py-3 text-center bg-gray-800">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {sortedRegistrations.map((reg) => {
            const colorClass =
              yearColors[Number(reg.year)] || "bg-gray-800/40 text-gray-200";
            const isProcessing = processingIds[reg.id];

            return (
              <React.Fragment key={reg.id}>
                <tr
                  className="hover:bg-gray-800/50 transition cursor-pointer"
                  onClick={() => onToggleRow(reg.id)}
                >
                  <td className="px-4 py-3 text-gray-500">
                    {expandedRow === reg.id ? (
                      <ChevronUpIcon
                        size={16}
                        className="transition duration-200"
                      />
                    ) : (
                      <ChevronDownIcon
                        size={16}
                        className="transition duration-200"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{reg.full_name}</td>
                  {/* <td className="px-4 py-3 text-gray-400">{reg.email}</td> */}
                  {/* <td className="px-4 py-3 text-gray-400">{reg.roll_number}</td> */}
                  <td className="px-4 py-3 text-gray-400">{reg.branch}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full border text-xs font-semibold ${colorClass}`}
                    >
                      {reg.year}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {reg.phone_number}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reg.registration_type === "vocalist"
                          ? "bg-rose-900/50 text-rose-300"
                          : "bg-emerald-900/50 text-emerald-300"
                      }`}
                    >
                      {reg.registration_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${reg.synced_to_sheet ? "bg-green-400" : "bg-yellow-400"}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
  {new Date(reg.submitted_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}
</td>
                  {/* Added Interactive Action Button Cell (Pinned to right side for horizontal scroll viewports) */}
                  <td className="px-4 py-3 text-center bg-gray-900/95 backdrop-blur-sm ">
                    <button
                      onClick={(e) => handleAddToTeamClick(e, reg)}
                      disabled={isProcessing}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isProcessing
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-white/10 hover:bg-white/20 text-white shadow-sm"
                      }`}
                    >
                      {isProcessing ? "Adding..." : "Add to Team"}
                    </button>
                  </td>
                </tr>

                {expandedRow === reg.id && (
                  <tr className="bg-gray-800/30">
                    <td colSpan={11} className="px-8 py-5">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                        <Detail label="Full Name" value={reg.full_name} />
                        <Detail label="Email" value={reg.email} />
                        <Detail label="Roll Number" value={reg.roll_number} />
                        <Detail label="Branch" value={reg.branch} />
                        <Detail label="Year" value={reg.year} />
                        <Detail label="Phone Number" value={reg.phone_number} />
                        <Detail
                          label="Registration Type"
                          value={reg.registration_type}
                          capitalize
                        />

                        {reg.registration_type === "vocalist" && (
                          <>
                            <Detail label="Languages" value={reg.languages} />
                            <div className="col-span-2 md:col-span-3">
                              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                Backing Track / Karaoke Links
                              </p>
                              {reg.backing_track_links ? (
                                <div className="flex flex-col gap-1">
                                  {reg.backing_track_links
                                    .split(/[\s,]+/)
                                    .filter((link) => link.trim() !== "")
                                    .map((link, index) => (
                                      <a
                                        key={index}
                                        href={
                                          link.startsWith("http")
                                            ? link
                                            : `https://${link}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:underline break-all block"
                                      >
                                        {link}
                                      </a>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-gray-600">—</p>
                              )}
                            </div>
                          </>
                        )}

                        {reg.registration_type === "instrumentalist" && (
                          <>
                            <div className="col-span-2 md:col-span-3">
                              <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">
                                Instruments
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(reg.instruments ?? []).length > 0 ? (
                                  (reg.instruments ?? []).map((inst) => (
                                    <span
                                      key={inst}
                                      className="bg-emerald-900/40 text-emerald-300 text-xs px-2 py-1 rounded-full"
                                    >
                                      {inst}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-600">—</span>
                                )}
                              </div>
                            </div>
                            <Detail
                              label="Needs Instrument from Club"
                              value={reg.needs_instrument ? "Yes" : "No"}
                            />
                          </>
                        )}

                        <div className="col-span-2 md:col-span-3">
                          <Detail label="Remarks" value={reg.remarks} />
                        </div>

                        <Detail
                          label="Submitted At"
                          value={new Date(reg.submitted_at).toLocaleString()}
                        />
                        <Detail
                          label="Sheet Synced"
                          value={reg.synced_to_sheet ? "✓ Yes" : "⏳ Pending"}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {registrations.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          No registrations yet.
        </div>
      )}
    </div>
  );
}
