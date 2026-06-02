"use client";

import { StatsFilters } from "@/components/admin/auditions/StatsFilters";
import { RegistrationsTable } from "@/components/admin/auditions/RegistrationsTable";
import { addRegistrationToTeam } from "@/lib/actions/team";
import { archiveAuditionData } from "@/lib/actions/archive";
import { useState, useEffect } from "react"; // Added useEffect
import { SquircleIconButton } from "@/components/SquircleIconButton";
import { ArchiveIcon } from "@/components/ui/ArchiveIcon";
import { Disc3Icon } from "@/components/ui/Disc3Icon";

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

type AuditionsSectionProps = {
  registrations: Registration[];
  filter: "all" | "vocalist" | "instrumentalist";
  expandedRow: string | null;
  yearColors: Record<number, string>;
  onFilterChange: (filter: "all" | "vocalist" | "instrumentalist") => void;
  onToggleRow: (id: string) => void;
};

export function AuditionsSection({
  registrations: initialRegistrations, // Rename prop to keep track of initial data
  filter,
  expandedRow,
  yearColors,
  onFilterChange,
  onToggleRow,
}: AuditionsSectionProps) {
  // Move registrations into local component state to handle real-time UI clearing
  const [registrations, setRegistrations] =
    useState<Registration[]>(initialRegistrations);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [banner, setBanner] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Sync state if server data changes down the line
  useEffect(() => {
    setRegistrations(initialRegistrations);
  }, [initialRegistrations]);

  const filtered =
    filter === "all"
      ? registrations
      : registrations.filter(
          (registration) => registration.registration_type === filter,
        );

  const handleAddToTeam = async (registration: any, parsedYear: number) => {
    try {
      await addRegistrationToTeam({
        full_name: registration.full_name,
        email: registration.email,
        phone_number: registration.phone_number,
        roll_number: registration.roll_number,
        year: registration.year,
        branch: registration.branch,
        registration_type: registration.registration_type,
        instruments: registration.instruments,
      });

      setBanner({
        message: `${registration.full_name} added to the current team!`,
        type: "success",
      });
    } catch (error: any) {
      setBanner({
        message: error.message || "An error occurred",
        type: "error",
      });
    }

    setTimeout(() => setBanner(null), 3000);
  };

  const executeArchival = async () => {
    setShowConfirm(false);
    setIsArchiving(true);
    try {
      const res = await archiveAuditionData();
      if (res?.success) {
        // Clear the state array directly to wipe entries from the view instantly
        setRegistrations([]);

        setBanner({
          message: `Successfully archived ${res.count} records and cleared current roster.`,
          type: "success",
        });
      }
    } catch (error: any) {
      setBanner({
        message: error.message || "Failed to complete archival query process.",
        type: "error",
      });
    } finally {
      setIsArchiving(false);
      setTimeout(() => setBanner(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sliding Banner Notification (Status Alerts) */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ease-out ${
          banner
            ? "translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-4"
            : "-translate-y-12 opacity-0 pointer-events-none"
        } ${
          banner?.type === "success"
            ? "bg-emerald-950/90 text-emerald-300 border-emerald-800 shadow-emerald-950/20"
            : "bg-rose-950/90 text-rose-300 border-rose-800 shadow-rose-950/20"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {banner?.type === "success" ? "✓" : "✕"}&nbsp;
          <span>{banner?.message}</span>
        </div>
      </div>

      {/* Sliding Confirmation Banner */}
<div
  className={`fixed z-50 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md bg-amber-950/95 border-amber-800 text-amber-200 transition-all duration-300 ease-out ${
    // PC Layout Strategy: Centered top banner positioning
    "sm:top-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md " +
    // Mobile Layout Strategy: Full-width bottom card overlay with margins
    "max-sm:bottom-4 max-sm:left-0 max-sm:right-0 max-sm:w-[calc(100%-2rem)] max-sm:mx-4 " +
    // Unified Toggle Transition Logic
    (showConfirm
      ? "translate-y-0 opacity-100"
      : "opacity-0 pointer-events-none sm:-translate-y-12 max-sm:translate-y-12")
  }`}
>
  <div className="flex flex-col gap-3 text-sm text-center sm:text-left">
    <p className="font-medium px-2 sm:px-0">
      ⚠️&nbsp; &nbsp; Archive all current registrations?
    </p>
   <p className="text-xs text-amber-300 px-2 sm:px-0">
      NOTE: &nbsp; This action cannot be undone. All the current registration data will be moved to an archival table and cleared from the active roster. Please ensure you have exported any necessary data before confirming.
    </p>
    
    <div className="grid grid-cols-1 gap-2 sm:flex sm:justify-end sm:gap-2 sm:mt-1">
      <button
        onClick={() => setShowConfirm(false)}
        className="w-full sm:w-auto px-3 py-2 sm:py-1 text-xs rounded-lg sm:rounded border-1 border-amber-700 hover:bg-amber-900 transition text-white font-medium sm:font-normal"
      >
        Cancel
      </button>
      <button
        onClick={executeArchival}
        className="w-full sm:w-auto px-3 py-2 sm:py-1 text-xs rounded-lg sm:rounded bg-amber-700 hover:bg-amber-600 transition font-medium text-white"
      >
        Archive
      </button>
    </div>
  </div>
</div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Auditions</h2>
        <SquircleIconButton
          icon={
            isArchiving ? (
              <Disc3Icon className="animate-spin" size={18} />
            ) : (
              <ArchiveIcon size={18} />
            )
          }
          label="Archive Active Registrations"
          onClick={() => {
            if (registrations.length === 0) {
              setBanner({
                message: "No data available to archive.",
                type: "error",
              });
              setTimeout(() => setBanner(null), 3000);
            } else {
              setShowConfirm(true);
            }
          }}
          disabled={isArchiving || registrations.length === 0}
          bgColor="bg-amber-600"
          size="md"
        />
      </div>

      <StatsFilters
        registrationsCount={registrations.length}
        vocalistCount={
          registrations.filter(
            (registration) => registration.registration_type === "vocalist",
          ).length
        }
        instrumentalistCount={
          registrations.filter(
            (registration) =>
              registration.registration_type === "instrumentalist",
          ).length
        }
        filter={filter}
        onFilterChange={onFilterChange}
      />

      <RegistrationsTable
        registrations={filtered}
        expandedRow={expandedRow}
        yearColors={yearColors}
        onToggleRow={onToggleRow}
        onAddToTeam={handleAddToTeam}
      />

      <p className="text-gray-600 text-xs mt-4 text-center">
        Click any row to expand full details
      </p>
    </div>
  );
}
