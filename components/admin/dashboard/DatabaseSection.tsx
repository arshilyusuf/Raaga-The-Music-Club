"use client";

import { useEffect, useState } from "react";
import { MasterRegistryView } from "../MasterRegistryView"; // Adjust the path based on your file structure
import { Database, ShieldAlert, Users } from "lucide-react";

export default function DatabaseSection() {
  const [totalRegistryRecords, setTotalRegistryRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDatabaseStats() {
      try {
        const response = await fetch("/api/dashboard/database-stats");
        const data = await response.json();

        if (response.ok) {
          setTotalRegistryRecords(data.totalMembers);
        } else {
          console.error("Failed to load database stats:", data.error);
        }
      } catch (error) {
        console.error("Network Error fetching database stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDatabaseStats();
  }, []);
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-gray-500 sm:text-sm">
        <span className="animate-pulse">
          Analyzing system database parameters...
        </span>
      </div>
    );
  }
  return (
    <div className="px-3 sm:px-35 sm:pb-20 space-y-6 animate-in fade-in duration-300">

      <div>
        <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
          Central Registry & Database
        </h2>
        <p className="text-xs text-gray-400 mt-1 sm:text-sm">
          Record of all members present or past. You can edit or delete any
          profile from here.
        </p>
      </div>

      {/* Main Grid Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Lightweight Metrics Cards & Info Alerts */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl border border-gray-800/60 bg-gray-900/20 backdrop-blur-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Database size={22} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">
                Total Registry Records
              </span>
              <span className="text-2xl font-bold text-white tracking-tight mt-0.5 block">
                {totalRegistryRecords}
              </span>
            </div>
          </div>

          <div className="hidden sm:block p-5 rounded-2xl border border-gray-800/60 bg-gray-900/20 backdrop-blur-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Users size={16} />
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Identity Profile System
              </h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Use the Master Registry view on the right to edit permanent
              profiles, personal handles, communication data, audit cross-year
              club affiliation trees, or delete records entirely.
            </p>
          </div>

          <div className="hidden sm:block p-4 rounded-xl border border-yellow-900/20 bg-yellow-950/10 gap-3 items-start">
            <ShieldAlert
              size={16}
              className="text-yellow-500/80 shrink-0 my-1"
            />
            <p className="text-[11px] text-yellow-500/70 leading-relaxed">
              <strong>Note:</strong> Deleting a member profile is irreversible
              and will permanently remove all associated data from the registry.
              Please proceed with caution and ensure you have backed up any
              important information before confirming deletion.
            </p>
          </div>
        </div>

        {/* Right Column: Embedded Master Management Interactive Terminal */}
        <div className="lg:col-span-2">
          <MasterRegistryView />
        </div>
      </div>
    </div>
  );
}
