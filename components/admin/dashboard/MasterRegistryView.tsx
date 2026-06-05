"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SquircleIconButton } from "@/components/SquircleIconButton";
import { DeleteIcon } from "../../ui/DeleteIcon";
import { SquarePenIcon } from "../../ui/SquarePenIcon";
import { Modal, MemberForm, MasterEditForm } from "./MemberForms"; // Ensure path points to your MemberForm components file

const LIMIT = 10;

export function MasterRegistryView() {
  const [deleteTarget, setDeleteTarget] = useState<{
    membershipId: string;
    profileId: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [groupedHistory, setGroupedHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setPage(0);
    fetchMasterHistory(0, true);
  }, [searchQuery]);

  async function fetchMasterHistory(
    currentPage: number,
    isInitial: boolean = false,
  ) {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await fetch(
        `/api/dashboard/master-registry?page=${currentPage}&limit=${LIMIT}&search=${encodeURIComponent(searchQuery)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch master history logs");
      }

      if (data) {
        // Process new incoming entries through the data mapper
        const processedNewData = processAndGroupMemberships(data);

        if (isInitial) {
          setGroupedHistory(processedNewData);
        } else {
          setGroupedHistory((prev) => {
            // Combine previous unique grouped profile states with the next page's items
            return [...prev, ...processedNewData];
          });
        }

        // If we received fewer items than the LIMIT, we know we hit the end of the records
        setHasMore(data.length === LIMIT);
      }
    } catch (error: any) {
      console.error("Error loading master registry logs:", error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function processAndGroupMemberships(flatData: any[]): any[] {
    return flatData.map((profile) => {
      const { club_memberships, ...profileWithoutMemberships } = profile;

      const formattedMemberships = (club_memberships || []).map(
        (membership: any) => ({
          id: membership.id,
          academic_year: membership.academic_year,
          year_of_study: membership.year_of_study,
        }),
      );

      // Sort memberships descending by academic year
      formattedMemberships.sort((a: any, b: any) =>
        b.academic_year.localeCompare(a.academic_year),
      );

      return {
        profile: profileWithoutMemberships,
        membershipsRaw: club_memberships || [],
        memberships: formattedMemberships,
      };
    });
  }

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage); // This accurately increments your offset index tracker state
    fetchMasterHistory(nextPage, false);
  }

 async function handleUpdateProfile(formData: any) {
    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/dashboard/master-registry", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: editingProfile.id, formData }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Server modification error");

      // OPTIMISTIC STATE UPDATE: Update local state immediately to avoid backend cache lag
      setGroupedHistory((prevGrouped) =>
        prevGrouped.map((item) => {
          if (item.profile.id === editingProfile.id) {
            return {
              ...item,
              profile: {
                ...item.profile,
                ...formData, // Injects new names, branches, status flags directly
                is_active: formData.is_active === true || formData.is_active === "true"
              },
            };
          }
          return item;
        })
      );

      setEditingProfile(null);
    } catch (err: any) {
      console.error(
        "❌ Profile modification database write failed:",
        err.message,
      );
      alert(`Update Failed: ${err.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleDeleteRecord(
    membershipId: string,
    profileId: string,
    e: React.MouseEvent,
  ) {
    e.stopPropagation();
    // Instead of browser confirm(), save target references to open our custom modal
    setDeleteTarget({ membershipId, profileId });
  }

  // 2. Executed when the user clicks "Confirm Delete" inside your custom popup UI
  async function executeDelete() {
    if (!deleteTarget) return;

    const { membershipId, profileId } = deleteTarget;
    setActionLoading(membershipId);
    setDeleteTarget(null); // Instantly close the confirmation overlay layout smoothly

    try {
      const response = await fetch(
        `/api/dashboard/master-registry?profileId=${profileId}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Server row removal error");

      setGroupedHistory((prev) =>
        prev.filter((item) => item.profile.id !== profileId),
      );
    } catch (error: any) {
      console.error("Complete deletion pipeline failed:", error.message);
      alert(`Deletion Failed: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="w-full flex flex-col rounded-2xl border border-gray-800/80 bg-gray-950 shadow-2xl overflow-hidden max-h-[75vh] min-h-100">
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-x-hidden overflow-y-auto">
          {/* Blur Backdrop Layer */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setDeleteTarget(null)}
          />

          {/* Modal Container Card */}
          <div className="relative w-full max-w-[92%] xs:max-w-md transform rounded-2xl border border-gray-800/80 bg-gray-950 p-4 sm:p-6 shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
            {/* Modal Heading Header */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base font-bold text-white sm:text-lg">
                Confirm Permanent Deletion
              </h3>
            </div>

            {/* Modal Body Info Copy */}
            <div className="space-y-3">
              <p className="text-xs text-gray-300 leading-relaxed sm:text-sm">
                Are you sure you want to permanently delete this member and{" "}
                <span className="text-red-400 font-semibold">ALL</span> of their
                historical club memberships from the database?
              </p>

              {/* Highlight Warning Alert Callout */}
              <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-3">
                <p className="text-[11px] text-red-400/90 leading-normal sm:text-xs">
                  <span className="font-bold uppercase tracking-wider block mb-0.5 text-[10px] text-red-400">
                    Important Note:
                  </span>
                  This action is irreversible. It will wipe their master profile
                  and cleanly clean out their associated timeline across all
                  active past and present academic years.
                </p>
              </div>
            </div>

            {/* Action Buttons Footer Row */}
            {/* Changed to flex-col-reverse on ultra-small viewports so the destructive action isn't accidentally clicked on mobile keyboards */}
            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full sm:w-auto rounded-xl border border-gray-800 bg-transparent px-4 py-2.5 sm:py-2 text-xs font-semibold text-gray-400 transition hover:bg-gray-900 hover:text-white active:scale-98 sm:text-sm h-10 sm:h-auto flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="w-full sm:w-auto rounded-xl bg-red-600 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white transition hover:bg-red-500 active:scale-98 shadow-lg shadow-red-950/20 sm:text-sm h-10 sm:h-auto flex items-center justify-center"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Search Bar Wrapper (Sticky Header Block) */}
      <div className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950 px-4 py-4 sm:px-6">
        <input
          type="text"
          placeholder="Search master profiles by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder-gray-500 transition sm:text-sm"
        />
      </div>

      {/* Content Body Layout (Captures Internal Scroll Layer) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 sm:p-6 scrollbar-none scrollbar-thumb-gray-800 scrollbar-track-transparent overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin mb-4" />
          </div>
        ) : groupedHistory.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-xs text-gray-600 sm:text-sm">
            No matching archive history records located.
          </div>
        ) : (
          <>
            {groupedHistory.map((group) => {
              const tm = group.profile;
              const isExpanded = expandedId === tm.id;
              const mostRecentMembership = group.memberships[0];
              const isProfileActive = tm.is_active;

              return (
                <div
                  key={tm.id}
                  onClick={() => setExpandedId(isExpanded ? null : tm.id)}
                  className={`border rounded-xl transition-all duration-200 cursor-pointer ${
                    isExpanded
                      ? "border-gray-700 bg-gray-900/70"
                      : "border-gray-800/40 bg-gray-900/40 hover:border-gray-800 hover:bg-gray-900/50"
                  }`}
                >
                  {/* Row Heading Summary Block */}
                  <div className="flex items-center justify-between gap-3 p-3 sm:gap-4 sm:p-4">
                    <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                      {tm.photo_url ? (
                        <img
                          src={tm.photo_url}
                          alt=""
                          className="h-8 w-8 rounded-full border border-gray-800 object-cover shrink-0 sm:h-10 sm:w-10"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-gray-400 shrink-0 sm:h-10 sm:w-10 sm:text-sm">
                          {tm.name?.[0] || "M"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-xs font-semibold text-white sm:text-sm">
                            {tm.name}
                          </p>
                          <div
                            className={`h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300 ${
                              isProfileActive
                                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                                : "bg-gray-600"
                            }`}
                          />
                        </div>

                        <div className="mt-0.5 flex flex-col text-[10px] text-gray-400 capitalize sm:flex-row sm:items-center sm:gap-1.5 sm:text-xs">
                          <span className="truncate font-medium text-gray-300">
                            {tm.role || tm.domain}
                          </span>
                          <span className="hidden text-gray-600 sm:inline">
                            •
                          </span>
                          <span className="text-gray-500">Year {tm.year}</span>
                        </div>
                      </div>
                    </div>

                    {/* Control Parameters Column */}
                    <div className="flex items-center gap-2 shrink-0 sm:gap-3">
                      {!isExpanded && (
                        <span className="rounded-full border border-blue-900/40 bg-blue-950/40 px-2 py-0.5 font-mono text-[9px] font-bold text-indigo-400 sm:px-2.5 sm:text-[11px]">
                          {mostRecentMembership?.academic_year}
                        </span>
                      )}

                      <SquircleIconButton
                        icon={<SquarePenIcon size={14} />}
                        label="Edit Profile"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          setEditingProfile(tm);
                        }}
                        disabled={actionLoading === mostRecentMembership?.id}
                        bgColor="bg-blue-900/40 hover:bg-blue-900/60 text-blue-400"
                        size="sm"
                      />

                      <SquircleIconButton
                        icon={
                          actionLoading === mostRecentMembership?.id ? (
                            <span className="block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent text-xs" />
                          ) : (
                            <DeleteIcon size={14} />
                          )
                        }
                        label="Delete Record"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          handleDeleteRecord(
                            mostRecentMembership?.id,
                            tm.id,
                            e,
                          );
                        }}
                        disabled={actionLoading === mostRecentMembership?.id}
                        bgColor="bg-red-900/40 hover:bg-red-900/60 text-red-400"
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Expandable Meta details Container */}
                  {isExpanded && (
                    <div className="border-t border-gray-800/60 bg-gray-950/30 px-4 pt-3 pb-4 space-y-4 text-[11px] sm:text-xs">
                      {/* Changed to responsive grid for mobile optimization */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                        <div>
                          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                            Email Address
                          </span>
                          <p className="mt-0.5 truncate text-gray-300">
                            {tm.email || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                            Phone Index
                          </span>
                          <p className="mt-0.5 truncate text-gray-300">
                            {tm.phone || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                            Roll Number
                          </span>
                          <p className="mt-0.5 truncate font-mono text-gray-300">
                            {tm.roll_number || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                            Academic Branch
                          </span>
                          <p className="mt-0.5 truncate text-gray-300">
                            {tm.branch || "—"}
                          </p>
                        </div>
                        {tm.instagram && (
                          <div className="sm:col-span-2 mt-0.5">
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

                      {/* Historical Club Affiliation Timeline View */}
                      <div className="border-t border-gray-900 pt-3">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                          Club Membership History ({group.memberships.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {group.memberships.map((membership: any) => (
                            <div
                              key={membership.id}
                              className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-2.5 py-1.5"
                            >
                              <span className="font-mono font-bold text-indigo-400 text-[10px]">
                                {membership.academic_year}
                              </span>
                              <span className="text-gray-600">|</span>
                              <span className="text-gray-300 capitalize text-[10px] sm:text-xs">
                                {tm.role || tm.domain} (Year{" "}
                                {membership.year_of_study})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

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

      {editingProfile && (
        <Modal
          title="Edit Master Profile Detail"
          onClose={() => setEditingProfile(null)}
        >
          <MasterEditForm
            initial={editingProfile}
            onSave={handleUpdateProfile}
            onCancel={() => setEditingProfile(null)}
            saving={isSavingProfile}
          />
        </Modal>
      )}
    </div>
  );
}
