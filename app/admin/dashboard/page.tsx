"use client";
import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Modal,
  MemberForm,
  HistoryMemberForm,
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

// ─── Main dashboard ───────────────────────────────────────────────────────────

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

  // UI state
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [expandedHistYear, setExpandedHistYear] = useState<string | null>(null);
  const [expandedArchYear, setExpandedArchYear] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "vocalist" | "instrumentalist">(
    "all",
  );
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "team" | "history" | "archive" | "auditions"
  >(
    (searchParams.get("tab") as "team" | "history" | "archive" | "auditions") ||
      "team",
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

  // ── Auth ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadAll();
    });
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);

    // 1. Dynamically calculate the current academic cycle string (e.g., 2026 -> "2026-27")
    const currentCalendarYear = new Date().getFullYear();
    const shortNextYear = String(currentCalendarYear + 1).slice(-2);
    const currentActiveAcademicYearStr = `${currentCalendarYear}-${shortNextYear}`; // Result: "2026-27"

    const [activeMembersQuery, ay, allMembershipsQuery, hp, ae, regs] =
      await Promise.all([
        // Fetch current active team members for the active academic cycle
        supabase
          .from("club_memberships")
          .select(
            `
          id,
          academic_year,
          year_of_study,
          domain,
          role,
          is_active,
          team_members (*)
        `,
          )
          .eq("academic_year", currentActiveAcademicYearStr)
          .eq("is_active", true)
          .order("year_of_study", { ascending: true }),

        // Fetch academic years list
        supabase
          .from("academic_years")
          .select("*")
          .order("start_year", { ascending: false }),

        // Fetch all memberships for historical records
        supabase.from("club_memberships").select(`
        id,
        academic_year,
        year_of_study,
        domain,
        role,
        is_active,
        team_members (*)
      `),

        // Remaining independent tables
        supabase.from("history_photos").select("*").order("created_at"),
        supabase
          .from("audition_archive")
          .select("*")
          .order("archived_at", { ascending: false }),
        supabase
          .from("audition_registrations")
          .select("*")
          .order("submitted_at", { ascending: false }),
      ]);

    // Format active members for the current active cycle layout view
    if (activeMembersQuery.data) {
      const formattedActive = activeMembersQuery.data
        .filter((item: any) => item.team_members !== null)
        .map((item: any) => ({
          id: item.team_members?.id,
          membership_id: item.id,
          name: item.team_members?.name,
          branch: item.team_members?.branch,
          email: item.team_members?.email,
          phone: item.team_members?.phone,
          roll_number: item.team_members?.roll_number,
          instagram: item.team_members?.instagram,
          photo_url: item.team_members?.photo_url,
          year: item.year_of_study,
          domain: item.domain,
          role: item.role,
          is_active: item.is_active,
          academic_year: item.academic_year,
        }));
      setTeamMembers(formattedActive);
      console.log("Fetched active team members:", formattedActive);
    }

    // Format historical records (Excludes current active cycle rows)
    if (allMembershipsQuery.data) {
      const formattedHistory = allMembershipsQuery.data
        .filter(
          (item: any) =>
            item.team_members !== null &&
            !(
              item.academic_year === currentActiveAcademicYearStr &&
              item.is_active === true
            ),
        )
        .map((item: any) => ({
          id: item.team_members?.id, // Profile ID
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
          is_active: item.is_active,
          academic_year: item.academic_year,
          academic_year_id: item.academic_year,
        }));
      setHistoryMembers(formattedHistory);
    }

    if (ay.data) setAcademicYears(ay.data);
    if (hp.data) setHistoryPhotos(hp.data);
    if (ae.data) setArchiveEntries(ae.data);
    if (regs.data) setRegistrations(regs.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab") as
      | "team"
      | "history"
      | "archive"
      | "auditions"
      | null;
    if (tab && ["team", "history", "archive", "auditions"].includes(tab)) {
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

  function switchTab(tab: "team" | "history" | "archive" | "auditions") {
    setActiveTab(tab);
    router.push(`/admin/dashboard?tab=${tab}`);
  }

  async function addMember(
    data: Omit<TeamMember, "id" | "is_active"> & {
      is_existing_member?: boolean;
      member_id?: string;
      academic_year: string; // Dynamic academic year string passed from the form state (e.g., "2026-27")
      is_active?: boolean; // Accepts the active toggle status value from the form wrapper state
    },
  ) {
    // 1. Run validation rules exclusively for brand new member profiles
    if (!data.is_existing_member) {
      if (data.phone && data.phone.length !== 10) {
        alert("Validation Error: Phone number must be exactly 10 digits.");
        return;
      }

      if (data.roll_number && data.roll_number.length !== 8) {
        alert("Validation Error: Roll number must be exactly 8 digits.");
        return;
      }
    }

    setSaving(true);
    let finalMemberId = data.member_id;

    // 2. Scenario A: Insert profile variables strictly into the baseline information table
    if (!data.is_existing_member) {
      const { data: newProfile, error: profileError } = await supabase
        .from("team_members")
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            roll_number: data.roll_number,
            branch: data.branch,
            instagram: data.instagram,
            photo_url: data.photo_url,
            // Removed redundant 'is_active' field here to stay aligned with your normalized schemas
          },
        ])
        .select("id")
        .single();

      if (profileError) {
        console.error(
          "Failed to create baseline profile:",
          profileError.message,
        );
        alert(`Database Error: ${profileError.message}`);
        setSaving(false);
        return;
      }
      finalMemberId = newProfile.id;
    } else {
      // Scenario B: If re-activating an old profile on an active year, switch off other historical cycles
      if (data.is_active !== false) {
        await supabase
          .from("club_memberships")
          .update({ is_active: false })
          .eq("member_id", finalMemberId);
      }
    }

    // 3. Final Step: Bind the resolved profile directory ID onto the historical structural log entry
    const { error: membershipError } = await supabase
      .from("club_memberships")
      .insert([
        {
          member_id: finalMemberId,
          academic_year: data.academic_year, // Saves the chosen selection string safely to tracking tables
          year_of_study: data.year || 1, // Maps frontend UI grouping field key 'year' onto your tracking column
          domain: data.domain || "musician",
          role: data.role || "Member",
          is_active: data.is_active ?? true, // Passes status strictly inside the cyclic tracking structure
        },
      ]);

    setSaving(false);

    if (!membershipError) {
      setModal(null);
      loadAll(); // Re-runs your custom filtering split on complete configuration blocks
    } else {
      console.error(
        "Failed to add member to the current team roster:",
        membershipError.message,
      );
      alert(`Membership Configuration Error: ${membershipError.message}`);
    }
  }
// Add this temporary line directly inside your AdminDashboardContent component:

 async function updateMember(
  id: string, // Unique core profile UUID (team_members.id)
  data: any,
) {
  setSaving(true);

  // 1. Structural update values for core profile registry
  const profileUpdates = {
    name: data.name,
    email: data.email,        
    phone: data.phone,        
    roll_number: data.roll_number, 
    branch: data.branch,
    instagram: data.instagram,
    photo_url: data.photo_url,
    updated_at: new Date().toISOString(),
  };

  // 2. Normalizes status parameters to clean literal database booleans
  const isMemberActive = data.is_active === true || data.is_active === "true";

  const membershipUpdates = {
    year_of_study: Number(data.year), 
    domain: data.domain,
    role: data.role,
    academic_year: data.academic_year,
    is_active: isMemberActive, 
  };

  // 3. Concurrently alter both database rows using direct ID identifiers
  const [profileResult, membershipResult] = await Promise.all([
    supabase.from("team_members").update(profileUpdates).eq("id", id),
    supabase
      .from("club_memberships")
      .update(membershipUpdates)
      .eq("id", data.membership_id),
  ]);

  if (profileResult.error || membershipResult.error) {
    const errMsg = profileResult.error?.message || membershipResult.error?.message;
    console.error("❌ Failed to commit database modifications:", errMsg);
    alert(`Update Failed: ${errMsg}`);
    setSaving(false);
    return;
  }

  // 4. Await data refetch so downstream view states render updated values instantly
  await loadAll(); 

  // 5. Terminate overlay presentation layout components smoothly
  setModal(null);
  setEditingMember(null);
  setSaving(false);
}
async function deleteMember(membershipId: string) {
  if (!confirm("Are you sure you want to set this member to Inactive?")) return;

  setActionLoading(membershipId);

  const currentCalendarYear = new Date().getFullYear();
  const shortNextYear = String(currentCalendarYear + 1).slice(-2);
  const currentActiveAcademicYearStr = `${currentCalendarYear}-${shortNextYear}`;

  // 1. Try updating by direct membership row key
  const { data: updatedData, error } = await supabase
    .from("club_memberships")
    .update({ is_active: false })
    .eq("id", membershipId)
    .select();

  // 2. Fallback: If 0 rows altered, treat the argument as the profile user UUID
  if (!error && (!updatedData || updatedData.length === 0)) {
    await supabase
      .from("club_memberships")
      .update({ is_active: false })
      .eq("member_id", membershipId) 
      .eq("academic_year", currentActiveAcademicYearStr);
  }

  await loadAll();
  setActionLoading(null);
}

async function moveTeamToHistory() {
  if (!moveToHistoryYear) {
    alert("Please select a target historical academic year from the dropdown.");
    return;
  }
  
  setSaving(true);

  // 1. Dynamically calculate the active academic year string (e.g., "2026-27")
  const currentCalendarYear = new Date().getFullYear();
  const shortNextYear = String(currentCalendarYear + 1).slice(-2);
  const currentActiveAcademicYearStr = `${currentCalendarYear}-${shortNextYear}`;

  // 2. Resolve the target history text label from your academicYears state array.
  // This handles instances where the dropdown passes a database UUID instead of the raw text label.
  const matchedYearRecord = academicYears.find(
    (ay) => ay.id === moveToHistoryYear || ay.label === moveToHistoryYear
  );
  
  const targetHistoryYearLabel = matchedYearRecord ? matchedYearRecord.label : moveToHistoryYear;

  // Safety block: Prevent users from accidentally archiving the current year onto itself
  if (targetHistoryYearLabel === currentActiveAcademicYearStr) {
    alert("Validation Error: You cannot archive the current active team into the current active academic year.");
    setSaving(false);
    return;
  }

  // 3. Update all current season rows to be inactive AND stamp them with the chosen history cycle year
  const { error } = await supabase
    .from("club_memberships")
    .update({ 
      is_active: false,                       // Moves them out of active roster lists
      academic_year: targetHistoryYearLabel   // Seals them into the targeted historical folder view
    })
    .eq("academic_year", currentActiveAcademicYearStr)
    .eq("is_active", true);

  if (!error) {
    // 4. Await data refetch so the layout partitions re-calculate instantly
    await loadAll();
    setModal(null);
    setMoveToHistoryYear("");
  } else {
    console.error("Failed to archive current team setup:", error.message);
    alert(`Database Archival Error: ${error.message}`);
  }

  setSaving(false);
}

  async function deleteHistoryMember(membershipId: string) {
    if (
      !confirm("Remove this member from this specific academic year's history?")
    )
      return;

    setActionLoading(membershipId);

    const { error } = await supabase
      .from("club_memberships")
      .delete()
      .eq("id", membershipId); // Wipes out just the historical entry for that year

    setActionLoading(null);

    if (!error) {
      loadAll();
    } else {
      console.error("Failed to delete historical record:", error.message);
    }
  }
  async function addHistoryMember(
    data: HistoryMemberDraft & {
      is_existing_member?: boolean;
      member_id?: string;
      academic_year?: string;
      study_year?: number;
    },
  ) {
    setSaving(true);

    let finalMemberId = data.member_id;

    // 1. Core Profile Layer Insertion
    if (!data.is_existing_member) {
      const { data: newProfile, error: profileError } = await supabase
        .from("team_members")
        .insert([
          {
            name: data.name,
            email: data.email, // Added
            phone: data.phone, // Added
            roll_number: data.roll_number, // Added
            branch: data.branch,
            instagram: data.instagram,
            photo_url: data.photo_url,
          },
        ])
        .select("id")
        .single();

      if (profileError) {
        console.error(
          "Failed to create historical profile:",
          profileError.message,
        );
        setSaving(false);
        return;
      }

      finalMemberId = newProfile.id;
    }

    // 2. Resolve target year from form input fallback to modal target variable
    const targetedYear = data.academic_year || historyMemberTargetYear;

    if (!targetedYear) {
      console.error(
        "Historical Context Error: Academic Year string is missing.",
      );
      setSaving(false);
      alert("Please select an Academic Year before saving.");
      return;
    }

    // 3. Structural Membership Record Insertion
    const { error: membershipError } = await supabase
      .from("club_memberships")
      .insert([
        {
          member_id: finalMemberId,
          academic_year: targetedYear,
          // Fallback check maps frontend 'study_year' or 'year' safely to database
          year_of_study: data.study_year || data.year || 1,
          domain: data.domain || "musician",
          role: data.role || "Member",
          // Fallback checks form state value toggled by user status dot button
          is_active: data.is_active ?? false,
        },
      ]);

    setSaving(false);

    if (!membershipError) {
      setModal(null);
      setHistoryMemberTargetYear(null);
      loadAll();
    } else {
      console.error(
        "Failed to add historical membership record:",
        membershipError.message,
      );
      alert(`Database Error: ${membershipError.message}`);
    }
  }

  /**
   * Fetches existing team members matching a search query.
   * Limits results to 10 for rapid UI rendering and performance.
   */
  async function searchExistingMembers(searchQuery: string) {
    if (!searchQuery.trim()) return [];

    const { data, error } = await supabase
      .from("team_members")
      .select("id, name, email, roll_number, branch, instagram, photo_url")
      // Searches across both name and roll number columns safely
      // Using ilike makes the search case-insensitive
      .or(`name.ilike.%${searchQuery}%,roll_number.ilike.%${searchQuery}%`)
      .limit(10);

    if (error) {
      console.error("Error searching profiles:", error.message);
      throw error;
    }

    return data;
  }
  // ── Academic years ───────────────────────────────────────────────────────────

  async function addAcademicYear() {
    if (!newYearLabel) return;
    setSaving(true);
    await supabase
      .from("academic_years")
      .insert([{ label: newYearLabel, start_year: newYearStart }]);
    setSaving(false);
    setModal(null);
    setNewYearLabel("");
    loadAll();
  }

  async function deleteAcademicYear(id: string) {
    if (!confirm("Delete this year and all its history/photos?")) return;
    setActionLoading(id);
    await supabase.from("academic_years").delete().eq("id", id);
    setActionLoading(null);
    loadAll();
  }

  async function addPhoto() {
    if (!newPhotoUrl || !photoTargetYear) return;
    setSaving(true);
    await supabase.from("history_photos").insert([
      {
        academic_year_id: photoTargetYear,
        cloudinary_url: newPhotoUrl,
        caption: newPhotoCaption || null,
      },
    ]);
    setSaving(false);
    setModal(null);
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    loadAll();
  }

  async function deletePhoto(id: string) {
    if (!confirm("Delete this photo?")) return;
    setActionLoading(id);
    await supabase.from("history_photos").delete().eq("id", id);
    setActionLoading(null);
    loadAll();
  }

  // ── Archive ──────────────────────────────────────────────────────────────────

  async function deleteArchiveEntry(id: string) {
    if (!confirm("Permanently delete this archive entry?")) return;
    setActionLoading(id);
    await supabase.from("audition_archive").delete().eq("id", id);
    setActionLoading(null);
    loadAll();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

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
      // FIX: Add m.domain === "musician" condition here
      members: teamMembers.filter(
        (m) => m.year === y && m.domain === "musician",
      ),
    }))
    .filter((g) => g.members.length > 0);

  // This remains the same—it correctly catches management and other domains
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
        {/* ══════════════════════════════════════════════════════════ CURRENT TEAM */}
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
            actionLoading={actionLoading}
            yearLabel={yearLabel}
            onAddYear={() => setModal("addYear")}
            onToggleYear={(yearId) =>
              setExpandedHistYear(expandedHistYear === yearId ? null : yearId)
            }
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

      {/* ══════════════════════════════════════════════════════════ MODALS */}

      {modal === "addMember" && (
        <Modal title="Add Team Member" onClose={() => setModal(null)}>
          <MemberForm
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

      {modal === "editMember" && editingMember && (
        <Modal
          title="Edit Member"
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
              year: editingMember.year || 1,
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
        >
          <div className="space-y-4">
            {/* <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Academic Year *
              </label>
              <select
                value={historyMemberTargetYear ?? ""}
                onChange={(e) => setHistoryMemberTargetYear(e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="">— Select year —</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.label}
                  </option>
                ))}
              </select>
            </div> */}
            <HistoryMemberForm
              initial={emptyHistoryMember()}
              onSave={(formData: any) => {
                // 1. Find the year record in your state array that matches the selected ID
                // (assuming your academic years state variable is named 'academicYears')
                const matchedYearRecord = academicYears.find(
                  (y: any) =>
                    y.id === formData.academic_year ||
                    y.label === formData.academic_year,
                );

                // 2. Pass the text string label ("2025-26") rather than the database UUID
                addHistoryMember({
                  ...formData,
                  academic_year: matchedYearRecord
                    ? matchedYearRecord.label
                    : formData.academic_year,
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
