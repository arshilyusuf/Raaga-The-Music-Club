"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SquircleIconButton } from "@/components/SquircleIconButton";
import { DeleteIcon } from "../ui/DeleteIcon";
import { SquarePenIcon } from "../ui/SquarePenIcon";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEditMember: (member: any) => void;
}

const LIMIT = 10;

export function HistoryDrawer({ isOpen, onClose, onEditMember }: HistoryDrawerProps) {
  const supabase = createBrowserSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Re-fetch data whenever modal visibility changes or search query mutates
  useEffect(() => {
    if (isOpen) {
      setPage(0);
      fetchMasterHistory(0, true);
    }
  }, [isOpen, searchQuery]);

  async function fetchMasterHistory(
    currentPage: number,
    isInitial: boolean = false,
  ) {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    const fromRange = currentPage * LIMIT;
    const toRange = fromRange + LIMIT - 1;

    // Use a clean search filter strategy if query text exists
    let query = supabase
      .from("club_memberships")
      .select(
        `
        id,
        academic_year,
        year_of_study,
        domain,
        role,
        is_active,
        team_members!inner (
          id,
          name,
          email,
          phone,
          roll_number,
          branch,
          photo_url,
          instagram
        )
      `,
      )
      .order("academic_year", { ascending: false })
      .range(fromRange, toRange);

    if (searchQuery.trim()) {
      query = query.ilike("team_members.name", `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      const sanitized = data.filter((item) => item.team_members !== null);

      if (isInitial) {
        setAllHistory(sanitized);
      } else {
        setAllHistory((prev) => [...prev, ...sanitized]);
      }

      setHasMore(data.length === LIMIT);
    } else {
      console.error("Error loading master registry logs:", error?.message);
    }

    setLoading(false);
    setLoadingMore(false);
  }

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMasterHistory(nextPage, false);
  }

  async function handleDeleteRecord(membershipId: string, e: React.MouseEvent) {
    e.stopPropagation(); // Avoid triggering details toggle when clicking the action button
    if (
      !confirm(
        "Are you sure you want to permanently delete this membership record from database logs?",
      )
    )
      return;

    setActionLoading(membershipId);
    const { error } = await supabase
      .from("club_memberships")
      .delete()
      .eq("id", membershipId);

    if (!error) {
      setAllHistory((prev) => prev.filter((item) => item.id !== membershipId));
    } else {
      alert(`Deletion Failed: ${error.message}`);
    }
    setActionLoading(null);
  }

  if (!isOpen) return null;

  return (
    // FIXED: backdrop layout setup changed to overflow-y-auto and items-start to fix dynamic phone heights
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-md sm:p-4 md:p-10">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-transparent transition-opacity"
        onClick={onClose}
      />

      {/* Center Modal Container - Added clear top margins for explicit mobile viewport clearance */}
      <div className="relative mt-16 mb-6 flex h-[75vh] w-full max-w-3xl flex-col overflow-hidden  rounded-2xl border border-gray-800/80 bg-gray-950 shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:mt-6">
        {/* Header Section */}
        <div className="sticky top-0 z-20 flex flex-col justify-between gap-4 border-b border-gray-800 bg-gray-950/80 px-6 py-4 backdrop-blur-md sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight sm:text-lg">
              Master Registry
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5 sm:text-xs">
              Complete List of Members present and past.
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 h-8 w-8 rounded-lg flex items-center justify-center text-sm transition outline-none sm:relative sm:top-auto sm:right-auto"
          >
            ✕
          </button>
        </div>

        {/* Search Bar Wrapper */}
        <div className="border-b border-gray-800 bg-gray-900/30 px-6 py-3">
          <input
            type="text"
            placeholder="Search member profiles by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder-gray-500 transition sm:text-sm"
          />
        </div>

        {/* Content Body Layout */}
        <div className="scrollbar-none overflow-hidden flex-1 overflow-y-auto bg-gray-950 p-4 space-y-3 sm:p-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-xs text-gray-500 sm:text-sm">
              <span className="animate-pulse">
                Loading core membership data logs...
              </span>
            </div>
          ) : allHistory.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-gray-600 sm:text-sm">
              No matching archive history records located.
            </div>
          ) : (
            <>
              {allHistory.map((item) => {
                const isExpanded = expandedId === item.id;
                const tm = item.team_members;

                return (
                  <div
                    key={item.id}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className={`border overflow-visible  rounded-xl transition-all duration-200 cursor-pointer ${
                      isExpanded
                        ? "border-gray-700 bg-gray-900/70"
                        : "border-gray-800/40 bg-gray-900/40 hover:border-gray-800 hover:bg-gray-900/50"
                    }`}
                  >
                    {/* Row Heading Summary Block */}
                    <div className="flex items-center  justify-between gap-3 p-3 sm:gap-4 sm:p-4">
                      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                        {tm?.photo_url ? (
                          <img
                            src={tm.photo_url}
                            alt=""
                            className="h-8 w-8 rounded-full border border-gray-800 object-cover shrink-0 sm:h-10 sm:w-10"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-gray-400 shrink-0 sm:h-10 sm:w-10 sm:text-sm">
                            {tm?.name?.[0] || "M"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-semibold text-white sm:text-sm">
                              {tm?.name}
                            </p>
                            {/* Emerald glowing status dot identifier */}
                            <div
                              className={`h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300 ${
                                item.is_active
                                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"
                                  : "bg-gray-600"
                              }`}
                              title={
                                item.is_active
                                  ? "Active Member"
                                  : "Past/Alumni Status"
                              }
                            />
                          </div>
                          
                          {/* FIXED: Elements now stack cleanly on mobile screen profiles */}
                          <div className="mt-0.5 flex flex-col text-[10px] text-gray-400 capitalize sm:flex-row sm:items-center sm:gap-1.5 sm:text-xs">
                            <span className="truncate font-medium text-gray-300">
                              {item.role || item.domain}
                            </span>
                            <span className="hidden text-gray-600 sm:inline">•</span>
                            <span className="text-gray-500">
                              Year {item.year_of_study}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Control Parameters Column */}
                      {/* Control Parameters Column */}
<div className="flex items-center gap-2 shrink-0 sm:gap-3">
  <span className="rounded-full border border-blue-900/40 bg-blue-950/40 px-2 py-0.5 font-mono text-[9px] font-bold text-indigo-400 sm:px-2.5 sm:text-[11px]">
    {item.academic_year}
  </span>

  {/* Edit Record Button */}
  <SquircleIconButton
    icon={<SquarePenIcon size={14} />}
    label="Edit Record"
    onClick={(e: any) => {
      e.stopPropagation(); // Prevents detail container fold dropdown from shifting
      
      // Flatten the structure to match what your edit form modal expects
      onEditMember({
        id: item.team_members.id,
        membership_id: item.id,
        name: item.team_members.name,
        email: item.team_members.email,
        phone: item.team_members.phone,
        roll_number: item.team_members.roll_number,
        branch: item.team_members.branch,
        instagram: item.team_members.instagram,
        photo_url: item.team_members.photo_url,
        year: item.year_of_study,
        domain: item.domain,
        role: item.role,
        academic_year: item.academic_year,
        is_active: item.is_active
      });
    }}
    disabled={actionLoading === item.id}
    bgColor="bg-blue-900/40 hover:bg-blue-900/60 text-blue-400"
    size="sm"
  />

  {/* Compact Row Level Deletion Trigger */}
  <SquircleIconButton
    icon={
      actionLoading === item.id ? (
        <span className="block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent text-xs" />
      ) : (
        <DeleteIcon size={14} />
      )
    }
    label="Delete Record"
    onClick={(e: any) => {
      e.stopPropagation(); // Stops detail dropdown from opening on click
      handleDeleteRecord(item.id, e);
    }}
    disabled={actionLoading === item.id}
    bgColor="bg-red-900/40 hover:bg-red-900/60 text-red-400"
    size="sm"
  />
</div>
                    </div>

                    {/* Expandable Meta details Container */}
                    {isExpanded && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-gray-800/60 bg-gray-950/30 px-4 pt-2 pb-4 text-[11px] animate-in fade-in slide-in-from-top-1 duration-150 sm:text-xs">
                        <div>
                          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                            Email Address
                          </span>
                          <p className="mt-0.5 truncate text-gray-300">
                            {tm?.email || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                            Phone Index
                          </span>
                          <p className="mt-0.5 truncate text-gray-300">
                            {tm?.phone || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                            Roll Number
                          </span>
                          <p className="mt-0.5 truncate font-mono text-gray-300">
                            {tm?.roll_number || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                            Academic Branch
                          </span>
                          <p className="mt-0.5 truncate text-gray-300">
                            {tm?.branch || "—"}
                          </p>
                        </div>
                        {tm?.instagram && (
                          <div className="col-span-2 mt-1 border-t border-gray-900 pt-2">
                            <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                              Instagram Directory Handle
                            </span>
                            <a
                              href={
                                tm.instagram.startsWith("http")
                                  ? tm.instagram
                                  : `https://instagram.com/${tm.instagram}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5 block truncate text-indigo-400 hover:text-indigo-300 hover:underline"
                            >
                              @
                              {tm.instagram
                                .replace(/.*instagram\.com\//, "")
                                .replace(/\/$/, "")}{" "}
                              ↗
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Dynamic Load More Trigger Component Block */}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    disabled={loadingMore}
                    onClick={handleLoadMore}
                    className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-2 text-[11px] font-medium text-gray-300 transition active:scale-98 disabled:opacity-50 sm:text-xs"
                  >
                    {loadingMore ? "Loading more records..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}