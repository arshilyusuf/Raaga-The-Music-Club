"use client";
import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Modal,
  MemberForm,
  MemberAddForm,
  HistoryMemberAddForm,
} from "@/components/admin/dashboard/MemberForms";
import { CurrentTeamSection } from "@/components/admin/dashboard/CurrentTeamSection";
import { HistorySection } from "@/components/admin/dashboard/HistorySection";
import { ArchiveSection } from "@/components/admin/dashboard/ArchiveSection";
import { AuditionsSection } from "@/components/admin/dashboard/AuditionsSection";
import { LogoutIcon } from "@/components/ui/LogoutIcon";
import { UserRoundPlusIcon } from "@/components/ui/UserRoundPlusIcon";
import { FolderClockIcon } from "@/components/ui/FolderClockIcon";
import { ArchiveIcon } from "@/components/ui/ArchiveIcon";
import { LoginScreen } from "@/components/admin/auditions/LoginScreen";
import { UsersRoundIcon } from "@/components/ui/UserRoundIcon";
import { Suspense } from "react";
import DatabaseSection from "@/components/admin/dashboard/DatabaseSection";
import { DatabaseBackupIcon } from "@/components/ui/DatabaseBackupIcon";
type TeamMember = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roll_number?: string;
  year: number;
  branch?: string;
  domain: string;
  role?: string;
  instagram?: string;
  photo_url?: string;
  is_active: boolean;
};

type AcademicYear = {
  id: string;
  label: string;
  start_year: number;
};

type HistoryMember = {
  id: string;
  academic_year_id: string;
  name: string;
  email?: string;
  phone?: string;
  roll_number?: string;
  year: number;
  branch?: string;
  domain?: string;
  role?: string;
  instagram?: string;
  photo_url?: string;
  is_active?: boolean;
};

type HistoryMemberDraft = Omit<HistoryMember, "id" | "academic_year_id">;

type HistoryPhoto = {
  id: string;
  academic_year_id: string;
  cloudinary_url: string;
  caption?: string;
};

type ArchiveEntry = {
  id: string;
  academic_year_label: string;
  full_name: string;
  email?: string;
  roll_number?: string;
  branch?: string;
  year?: string;
  phone_number?: string;
  registration_type?: string;
  languages?: string;
  backing_track_links?: string;
  instruments?: string[];
  needs_instrument?: boolean;
  remarks?: string;
  submitted_at?: string;
  archived_at: string;
};

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

const emptyMember = (): Omit<TeamMember, "id" | "is_active"> => ({
  name: "",
  email: "",
  phone: "",
  roll_number: "",
  year: 1,
  branch: "",
  domain: "musician",
  role: "",
  instagram: "",
  photo_url: "",
});

const emptyHistoryMember = (): HistoryMemberDraft => ({
  name: "",
  email: "",
  phone: "",
  roll_number: "",
  year: 1,
  branch: "",
  domain: "musician",
  role: "",
  instagram: "",
  photo_url: "",
});

export function AdminDashboardContent() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  // Data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [historyMembers, setHistoryMembers] = useState<HistoryMember[]>([]);
  const [historyPhotos, setHistoryPhotos] = useState<HistoryPhoto[]>([]);
  const [archiveEntries, setArchiveEntries] = useState<ArchiveEntry[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  // UI state
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [expandedHistYear, setExpandedHistYear] = useState<string | null>(null);
  const [expandedArchYear, setExpandedArchYear] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "vocalist" | "instrumentalist">(
    "all",
  );
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "team" | "history" | "archive" | "auditions" | "database"
  >(
    (searchParams.get("tab") as
      | "team"
      | "history"
      | "archive"
      | "auditions"
      | "database") || "team",
  );

  // Modal state
  const [modal, setModal] = useState<
    | null
    | "addMember"
    | "editMember"
    | "addYear"
    | "addPhoto"
    | "addHistoryMember"
    | "moveToHistory"
  >(null);
  const [editingMember, setEditingMember] = useState<
    | (TeamMember & {
        membership_id: string;
        academic_year: string;
      })
    | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [newYearLabel, setNewYearLabel] = useState("");
  const [newYearStart, setNewYearStart] = useState(new Date().getFullYear());
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [photoTargetYear, setPhotoTargetYear] = useState<string | null>(null);
  const [historyMemberTargetYear, setHistoryMemberTargetYear] = useState<
    string | null
  >(null);
  const [moveToHistoryYear, setMoveToHistoryYear] = useState<string>("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const loadTeamRoster = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/team-roster");
      if (!response.ok) throw new Error(`Roster status: ${response.status}`);

      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error("Failed loading team roster stream:", error);
    }
  }, []);
  const loadHistoryMeta = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/history-meta");
      if (!response.ok) throw new Error(`History status: ${response.status}`);

      const data = await response.json();
      setAcademicYears(data.academicYears);
      setHistoryPhotos(data.historyPhotos);
      setMemberCounts(data.memberCounts || {});
    } catch (error) {
      console.error("Failed loading historical metadata profiles:", error);
    }
  }, []);
  const loadAuditionsMeta = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/auditions-meta");
      if (!response.ok) throw new Error(`Auditions status: ${response.status}`);

      const data = await response.json();
      setArchiveEntries(data.archiveEntries);
      setRegistrations(data.registrations);
    } catch (error) {
      console.error("Failed loading archival auditing sheets:", error);
    }
  }, []);
  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadTeamRoster(),
      loadHistoryMeta(),
      loadAuditionsMeta(),
    ]);
    setLoading(false);
  }, [loadTeamRoster, loadHistoryMeta, loadAuditionsMeta]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);
  useEffect(() => {
    if (!session) return;

    const loadTabData = async () => {
      setLoading(true);

      try {
        if (activeTab === "team") {
          await loadTeamRoster();
        } else if (activeTab === "history" || activeTab === "database") {
          await loadHistoryMeta();
        } else if (activeTab === "auditions" || activeTab === "archive") {
          await loadAuditionsMeta();
        }
      } catch (err) {
        console.error(
          "Error contextualizing modular viewport load pipeline:",
          err,
        );
      } finally {
        setLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, session, loadTeamRoster, loadHistoryMeta, loadAuditionsMeta]);
  const loadHistoryByYear = useCallback(async (selectedYear: string) => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/history/${selectedYear}`);

      if (!response.ok) {
        throw new Error(
          `HTTP error fetching history for ${selectedYear}: ${response.status}`,
        );
      }

      const payload = await response.json();

      // Ensure our array map accounts for the structural data shift explicitly
      const structuredMembers = (payload.members || []).map((member: any) => ({
        ...member,
        // Ensure year_of_study handles both potential aliases for safety
        year_of_study: member.year_of_study || member.year,
      }));

      // Dynamically update the history viewer state with the correct properties
      setHistoryMembers(structuredMembers);

      console.log(
        `Fetched historical data for cycle: ${selectedYear}`,
        structuredMembers,
      );
    } catch (error) {
      console.error(
        `Failed pulling historical rosters for ${selectedYear}:`,
        error,
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);
  useEffect(() => {
    const tab = searchParams.get("tab") as
      | "team"
      | "history"
      | "archive"
      | "auditions"
      | "database"
      | null;
    if (
      tab &&
      ["team", "history", "archive", "auditions", "database"].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  async function login() {
    setLoginError("");
    setLoginLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);
    if (error) return setLoginError(error.message);
    setSession(data.session);
    loadAll();
  }
  async function logout() {
    try {
      setLoading(true);
      await supabase.auth.signOut();

      // Clear out all stale memory tracking states completely
      setSession(null);
      setTeamMembers([]);
      setAcademicYears([]);
      setHistoryMembers([]);
      setHistoryPhotos([]);
      setArchiveEntries([]);
      setRegistrations([]);

      // Clear navigation tabs back to default target roster panel
      setActiveTab("team");
    } catch (logoutError) {
      console.error(
        "Error gracefully terminating dashboard session:",
        logoutError,
      );
    } finally {
      setLoading(false);
    }
  }
  function switchTab(
    tab: "team" | "history" | "archive" | "auditions" | "database",
  ) {
    setActiveTab(tab);
    router.push(`/admin/dashboard?tab=${tab}`);
  }
  async function addMember(
    data: Omit<TeamMember, "id" | "is_active"> & {
      is_existing_member?: boolean;
      member_id?: string;
      academic_year: string;
      is_active?: boolean;
      year?: number;
    },
  ) {
    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "An error occurred while saving.");
        return;
      }

      setModal(null);
      await loadTeamRoster();
    } catch (error: any) {
      console.error("Failed to sync profile:", error);
      alert(`Network Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }
  async function updateMember(id: string, data: any) {
    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, data }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "An error occurred while updating.");
        return;
      }

      await loadTeamRoster();
      setModal(null);
      setEditingMember(null);
    } catch (error: any) {
      console.error("❌ Failed to commit database modifications:", error);
      alert(`Update Failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }
  async function deleteMember(membershipId: string) {
    if (
      !confirm(
        "Are you sure you want to remove this member from the current team roster? (Their profile will remain intact in the system)",
      )
    )
      return;

    setActionLoading(membershipId);
    try {
      const response = await fetch(
        `/api/dashboard/team?membershipId=${membershipId}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Removal Failed.");
        return;
      }
    } catch (error: any) {
      console.error(
        "❌ Failed to remove member from current team:",
        error.message,
      );
      alert(`Removal Failed: ${error.message}`);
    } finally {
      await loadTeamRoster();
      setActionLoading(null);
    }
  }
  async function moveTeamToHistory() {
    if (!moveToHistoryYear) {
      alert(
        "Please select a target historical academic year from the dropdown.",
      );
      return;
    }

    if (!teamMembers || teamMembers.length === 0) {
      alert(
        "There are no active team members in the current roster to migrate.",
      );
      return;
    }

    setSaving(true);

    const currentCalendarYear = new Date().getFullYear();
    const shortNextYear = String(currentCalendarYear + 1).slice(-2);
    const currentActiveAcademicYearStr = `${currentCalendarYear}-${shortNextYear}`;
    const matchedYearRecord = academicYears.find(
      (ay) => ay.id === moveToHistoryYear || ay.label === moveToHistoryYear,
    );

    const targetHistoryYearLabel = matchedYearRecord
      ? matchedYearRecord.label
      : moveToHistoryYear;

    if (targetHistoryYearLabel === currentActiveAcademicYearStr) {
      alert(
        "Validation Error: You cannot archive the current active team into the current active academic year.",
      );
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/dashboard/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamMembers,
          moveToHistoryYear,
          currentActiveAcademicYearStr,
          targetHistoryYearLabel,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Migration failed.");
        return;
      }

      console.log(
        `Successfully migrated members to ${targetHistoryYearLabel} and cleared the current roster.`,
      );
      await loadTeamRoster();
      setModal(null);
      setMoveToHistoryYear("");
    } catch (error: any) {
      console.error("Failed to migrate team setup:", error.message);
      alert(`Database Migration Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }
  async function deleteHistoryMember(memberId: string) {
    if (!memberId) return;

    if (
      !confirm("Remove this member from this specific academic year's history?")
    )
      return;

    // Find the text label (e.g., "2024-25") using the active expanded accordion state ID
    const activeYearObj = academicYears.find(
      (ay) => ay.id === expandedHistYear,
    );
    const academicYearLabel = activeYearObj ? activeYearObj.label : null;

    if (!academicYearLabel) {
      alert("Error: Could not resolve the active academic year context.");
      return;
    }

    setActionLoading(memberId);

    try {
      const response = await fetch(
        `/api/dashboard/history?memberId=${memberId}&academicYear=${encodeURIComponent(academicYearLabel)}`,
        { method: "DELETE" },
      );

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Failed to delete historical record.");
        return;
      }

      // Re-fetch historical context maps cleanly
      await loadHistoryMeta();

      // If your UI requires a localized refresh for the accordion contents, re-trigger it:
      if (activeYearObj?.label) {
        loadHistoryByYear(activeYearObj.label);
      }
    } catch (error) {
      console.error("Network Error deleting historical record:", error);
    } finally {
      setActionLoading(null);
    }
  }
  async function addHistoryMember(
    data: HistoryMemberDraft & {
      is_existing_member?: boolean;
      member_id?: string;
      academic_year?: string;
      study_year?: number;
      year?: number;
      domain?: string;
      role?: string;
    },
  ) {
    setSaving(true);
    const targetYearLabel = historyMemberTargetYear;

    try {
      const response = await fetch("/api/dashboard/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          historyMemberTargetYear: targetYearLabel,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(
          result.error || "An error occurred while saving historical profile.",
        );
        return;
      }

      setModal(null);
      setHistoryMemberTargetYear(null);

      if (targetYearLabel) {
        // Append the target year string label to the URL hash (e.g., #year-2025-26)
        // This acts as a persistent browser flag across the hard page reload
        window.location.hash = `year-${targetYearLabel}`;
      }

      // Execute full browser page reload to completely clear all corrupted state loops
      window.location.reload();
    } catch (error: any) {
      console.error("Failed updating historical configurations:", error);
      alert(`Network Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }
  async function addAcademicYear() {
    if (!newYearLabel) return;
    setSaving(true);

    try {
      const response = await fetch("/api/dashboard/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "addYear",
          newYearLabel,
          newYearStart,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(
          result.error ||
            "Failed to create academic year timeline configuration.",
        );
        return;
      }

      setModal(null);
      setNewYearLabel("");
      await loadHistoryMeta();
    } catch (error: any) {
      console.error("Network Error configuring academic year:", error);
    } finally {
      setSaving(false);
    }
  }
  async function deleteAcademicYear(id: string) {
    if (!confirm("Delete this year and all its history/photos?")) return;
    setActionLoading(id);

    try {
      const response = await fetch(
        `/api/dashboard/history?type=year&id=${id}`,
        {
          method: "PATCH",
        },
      );

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Failed to delete academic year.");
        return;
      }

      await loadTeamRoster();
    } catch (error: any) {
      console.error("Network Error deleting academic year:", error);
    } finally {
      setActionLoading(null);
    }
  }
  async function addPhoto() {
    if (!newPhotoUrl || !photoTargetYear) return;
    setSaving(true);

    try {
      const response = await fetch("/api/dashboard/history", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoTargetYear,
          newPhotoUrl,
          newPhotoCaption,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Failed to upload photo index.");
        return;
      }

      setModal(null);
      setNewPhotoUrl("");
      setNewPhotoCaption("");
      await loadHistoryMeta();
    } catch (error: any) {
      console.error("Network Error adding historical photo:", error);
    } finally {
      setSaving(false);
    }
  }
  async function deletePhoto(id: string) {
    if (!confirm("Delete this photo?")) return;
    setActionLoading(id);

    try {
      const response = await fetch(
        `/api/dashboard/history?type=photo&id=${id}`,
        {
          method: "PATCH",
        },
      );

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Failed to remove photo.");
        return;
      }

      await loadHistoryMeta();
    } catch (error: any) {
      console.error("Network Error deleting photo entry:", error);
    } finally {
      setActionLoading(null);
    }
  }
  async function deleteArchiveEntry(id: string) {
    if (!confirm("Permanently delete this archive entry?")) return;
    setActionLoading(id);

    try {
      const response = await fetch(`/api/dashboard/archive?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Failed to clear archive entry.");
        return;
      }

      await loadAuditionsMeta();
    } catch (error: any) {
      console.error("Network Error removing archive row:", error);
    } finally {
      setActionLoading(null);
    }
  }
  const yearLabel = (y: number) => {
    const map: Record<number, string> = {
      4: "Head Coordinator",
      3: "Core Coordinator",
      2: "Executive",
      1: "Member",
    };
    return map[y] ?? `${y}th Year`;
  };
  const yearColor = (y: number) => {
    const map: Record<number, string> = {
      4: "text-yellow-300 bg-yellow-900/30 border-1 border-yellow-700",
      3: "text-blue-300 bg-blue-900/30 border-1 border-blue-700",
      2: "text-purple-300 bg-purple-900/30 border-1 border-purple-700",
      1: "text-green-300 bg-green-900/30 border-1 border-green-700",
    };
    return map[y] ?? "text-gray-300 bg-gray-800";
  };
  const groupedTeam = [4, 3, 2, 1]
    .map((y) => ({
      year: y,
      label: yearLabel(y),
      members: teamMembers.filter(
        (m) => Number(m.year) === y && m.domain === "musician",
      ),
    }))
    .filter((g) => g.members.length > 0);

  const otherDomainMembers = teamMembers.filter((m) => m.domain !== "musician");
  if (!session) {
    return (
      <LoginScreen
        email={loginEmail}
        password={loginPassword}
        loading={loginLoading}
        error={loginError}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onLogin={login}
      />
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }
  return (
    <div className="mt-12 sm:mt-0 min-h-screen bg-gray-950 overflow-hidden text-white">
      <div className=" border-gray-800 py-4 flex items-center sticky bg-gray-950 z-40">
        <div className=" flex justify-center items-center w-full">
          <nav className="flex justify-center items-center gap-1">
            {(
              [
                { id: "team", icon: <UsersRoundIcon size={16} /> },
                { id: "history", icon: <FolderClockIcon size={16} /> },
                { id: "database", icon: <DatabaseBackupIcon size={16} /> },
                { id: "auditions", icon: <UserRoundPlusIcon size={16} /> },
                { id: "archive", icon: <ArchiveIcon size={16} /> },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                  activeTab === t.id
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
                title={t.id}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.id}</span>
              </button>
            ))}

            <button
              onClick={logout}
              className="bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/40 px-3 py-1.5 rounded-lg text-sm transition ml-1 sm:ml-3 flex items-center gap-1"
              title="Logout"
            >
              <span className="hidden sm:inline">Logout</span>
              <LogoutIcon size={16} />
            </button>
          </nav>
        </div>
      </div>

      <div className="px-3 py-4 sm:p-8 max-w-7xl mx-auto">
        {activeTab === "team" && (
          <CurrentTeamSection
            groupedTeam={groupedTeam}
            otherDomainMembers={otherDomainMembers}
            teamMembersCount={teamMembers.length}
            expandedMember={expandedMember}
            actionLoading={actionLoading}
            yearColor={yearColor}
            onToggleMember={(id) =>
              setExpandedMember(expandedMember === id ? null : id)
            }
            onEditMember={(member: any) => {
              setEditingMember(member);
              setModal("editMember");
            }}
            onDeleteMember={deleteMember}
            onMoveToHistory={() => setModal("moveToHistory")}
            onAddMember={() => setModal("addMember")}
          />
        )}

        {/* ══════════════════════════════════════════════════════════ HISTORY */}
        {activeTab === "history" && (
          <HistorySection
            academicYears={academicYears}
            historyMembers={historyMembers}
            historyPhotos={historyPhotos}
            onEditMember={(member: any) => {
              setEditingMember(member);
              setModal("editMember");
            }}
            expandedHistYear={expandedHistYear}
            memberCounts={memberCounts}
            actionLoading={
              actionLoading || (historyLoading ? expandedHistYear : null)
            }
            yearLabel={yearLabel}
            onAddYear={() => setModal("addYear")}
            onToggleYear={(yearId) => {
              const isOpening = expandedHistYear !== yearId;

              if (isOpening) {
                // ONLY clear the list if we are genuinely moving to a completely different year.
                // If the year is already open (e.g., during an update or meta sync), DO NOT clear it.
                if (!expandedHistYear) {
                  setHistoryMembers([]);
                }

                setExpandedHistYear(yearId);

                const targetYearObj = academicYears.find(
                  (ay: any) => ay.id === yearId,
                );
                if (targetYearObj?.label) {
                  loadHistoryByYear(targetYearObj.label);
                }
              } else {
                // Closing the accordion entirely
                setExpandedHistYear(null);
                setHistoryMembers([]);
              }
            }}
            onAddMember={(yearId) => {
              setHistoryMemberTargetYear(yearId);
              setModal("addHistoryMember");
            }}
            onAddPhoto={(yearId) => {
              setPhotoTargetYear(yearId);
              setModal("addPhoto");
            }}
            onDeleteYear={deleteAcademicYear}
            onDeleteHistoryMember={deleteHistoryMember}
            onDeletePhoto={deletePhoto}
          />
        )}

        {/* ══════════════════════════════════════════════════════════ ARCHIVE */}
        {activeTab === "archive" && (
          <ArchiveSection
            archiveEntries={archiveEntries}
            expandedArchYear={expandedArchYear}
            actionLoading={actionLoading}
            onToggleYear={(yearLabel) =>
              setExpandedArchYear(
                expandedArchYear === yearLabel ? null : yearLabel,
              )
            }
            onDeleteArchiveEntry={deleteArchiveEntry}
          />
        )}

        {activeTab === "auditions" && (
          <AuditionsSection
            registrations={registrations}
            filter={filter}
            expandedRow={expandedRow}
            yearColors={{
              1: "text-sky-400 border-sky-500/40",
              2: "text-cyan-400 border-cyan-500/40",
              3: "text-teal-400 border-teal-500/40",
              4: "text-indigo-400 border-indigo-500/40",
              5: "text-violet-400 border-violet-500/40",
            }}
            onFilterChange={setFilter}
            onToggleRow={(id) => setExpandedRow(expandedRow === id ? null : id)}
          />
        )}
      </div>

      {activeTab === "database" && <DatabaseSection />}

      {modal === "addMember" && (
        <Modal title="Add Team Member" onClose={() => setModal(null)}>
          <MemberAddForm
            initial={emptyMember()}
            onSave={(formData: any) =>
              addMember({
                ...formData,
                is_existing_member: false,
                academic_year: formData.academic_year,
              })
            }
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}

      {modal === "editMember" && editingMember && activeTab === "team" && (
        <Modal
          title="Edit Current Team Member"
          onClose={() => {
            setModal(null);
            setEditingMember(null);
          }}
        >
          <MemberForm
            initial={{
              name: editingMember.name || "",
              email: editingMember.email || "",
              phone: editingMember.phone || "",
              roll_number: editingMember.roll_number || "",
              year: editingMember.year || 1, // Reflects the current year from team_members
              branch: editingMember.branch || "",
              domain: editingMember.domain || "musician",
              role: editingMember.role || "Member",
              instagram: editingMember.instagram || "",
              photo_url: editingMember.photo_url || "",
              is_active: editingMember.is_active !== false,
              academic_year: editingMember.academic_year || "2026-27",
            }}
            onSave={(formData) =>
              updateMember(editingMember.id, {
                ...formData,
                membership_id: editingMember.membership_id,
                academic_year:
                  formData.academic_year ||
                  editingMember.academic_year ||
                  "2026-27",
              })
            }
            onCancel={() => {
              setModal(null);
              setEditingMember(null);
            }}
            saving={saving}
          />
        </Modal>
      )}

      {modal === "addYear" && (
        <Modal title="Add Academic Year" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Label (e.g. 2024-25) *
              </label>
              <input
                value={newYearLabel}
                onChange={(e) => setNewYearLabel(e.target.value)}
                placeholder="2024-25"
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Start Year *
              </label>
              <input
                type="number"
                value={newYearStart}
                onChange={(e) => setNewYearStart(Number(e.target.value))}
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={addAcademicYear}
                disabled={saving || !newYearLabel}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition"
              >
                {saving ? "Adding..." : "Add Year"}
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg py-2 text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "addPhoto" && (
        <Modal title="Add Photo" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Cloudinary URL *
              </label>
              <input
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Caption (optional)
              </label>
              <input
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                placeholder="Annual concert 2024"
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {newPhotoUrl && (
              <img
                src={newPhotoUrl}
                alt="preview"
                className="w-full rounded-lg object-cover max-h-40"
              />
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={addPhoto}
                disabled={saving || !newPhotoUrl}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition"
              >
                {saving ? "Adding..." : "Add Photo"}
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg py-2 text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "addHistoryMember" && (
        <Modal
          title="Add Member"
          onClose={() => {
            setModal(null);
            setHistoryMemberTargetYear(null);
          }}
          academicYearLabel={
            historyMemberTargetYear
              ? academicYears.find((ay) => ay.id === historyMemberTargetYear)
                  ?.label
              : null
          }
        >
          <div className="space-y-4">
            <HistoryMemberAddForm
              initial={emptyHistoryMember()}
              academicYears={academicYears}
              onSave={(formData: any) => {
                // 1. Find the year record matching the state variable 'historyMemberTargetYear'
                // checking both the database ID (UUID) and the raw text string label
                const matchedYearRecord = academicYears.find(
                  (y: any) =>
                    y.id === historyMemberTargetYear ||
                    y.label === historyMemberTargetYear,
                );

                // 2. Fall back to the raw state variable string if no database record object matches
                const finalAcademicYearStr = matchedYearRecord
                  ? matchedYearRecord.label
                  : historyMemberTargetYear;

                // 3. Dispatch payload with the correct text string label ("2024-25")
                addHistoryMember({
                  ...formData,
                  academic_year: finalAcademicYearStr,
                });
              }}
              onCancel={() => {
                setModal(null);
                setHistoryMemberTargetYear(null);
              }}
              saving={saving}
            />
          </div>
        </Modal>
      )}

      {modal === "moveToHistory" && (
        <Modal
          title="Move Current Team to History"
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              This will copy all {teamMembers.length} current team members into
              the selected academic year's history, then clear the current team.
              This cannot be undone.
            </p>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Select Academic Year *
              </label>
              <select
                value={moveToHistoryYear}
                onChange={(e) => setMoveToHistoryYear(e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="">— Select year —</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-amber-400">
              Tip: If the year doesn't exist yet, go to the History tab and add
              it first.
            </p>
            <div className="flex gap-3">
              <button
                onClick={moveTeamToHistory}
                disabled={
                  saving || !moveToHistoryYear || teamMembers.length === 0
                }
                className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition"
              >
                {saving ? "Moving..." : "Move to History"}
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg py-2 text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen" />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
