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
  study_year?: number;
  branch?: string;
  domain?: string;
  role?: string;
  instagram?: string;
  photo_url?: string;
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
  study_year: 1,
  branch: "",
  domain: "musician",
  role: "",
  instagram: "",
  photo_url: "",
});

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
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
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
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
    const [tm, ay, hm, hp, ae, regs] = await Promise.all([
      supabase
        .from("team_members")
        .select("*")
        .order("year", { ascending: false })
        .order("name"),
      supabase
        .from("academic_years")
        .select("*")
        .order("start_year", { ascending: false }),
      supabase.from("history_members").select("*").order("name"),
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
    if (tm.data) setTeamMembers(tm.data);
    if (ay.data) setAcademicYears(ay.data);
    if (hm.data) setHistoryMembers(hm.data);
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
      console.error("Error gracefully terminating dashboard session:", logoutError);
    } finally {
      setLoading(false);
    }
  }

  function switchTab(tab: "team" | "history" | "archive" | "auditions") {
    setActiveTab(tab);
    router.push(`/admin/dashboard?tab=${tab}`);
  }

  // ── Data loading ─────────────────────────────────────────────────────────────


  // ── Team CRUD ────────────────────────────────────────────────────────────────

  async function addMember(data: Omit<TeamMember, "id" | "is_active">) {
    setSaving(true);
    const { error } = await supabase
      .from("team_members")
      .insert([{ ...data, is_active: true }]);
    setSaving(false);
    if (!error) {
      setModal(null);
      loadAll();
    }
  }

  async function updateMember(
    id: string,
    data: Omit<TeamMember, "id" | "is_active">,
  ) {
    setSaving(true);
    const { error } = await supabase
      .from("team_members")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSaving(false);
    if (!error) {
      setModal(null);
      setEditingMember(null);
      loadAll();
    }
  }

  async function deleteMember(id: string) {
    if (!confirm("Delete this member from the current team?")) return;
    setActionLoading(id);
    await supabase.from("team_members").delete().eq("id", id);
    setActionLoading(null);
    loadAll();
  }

  // ── Move current team → history ──────────────────────────────────────────────

  async function moveTeamToHistory() {
    if (!moveToHistoryYear) return;
    setSaving(true);
    const inserts = teamMembers.map((m) => ({
      academic_year_id: moveToHistoryYear,
      name: m.name,
      email: m.email,
      phone: m.phone,
      roll_number: m.roll_number,
      study_year: m.year,
      branch: m.branch,
      domain: m.domain,
      role: m.role,
      instagram: m.instagram,
      photo_url: m.photo_url,
    }));
    await supabase.from("history_members").insert(inserts);
    await supabase
      .from("team_members")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    setSaving(false);
    setModal(null);
    loadAll();
  }

  // ── History member CRUD ──────────────────────────────────────────────────────

  async function deleteHistoryMember(id: string) {
    if (!confirm("Remove this member from history?")) return;
    setActionLoading(id);
    await supabase.from("history_members").delete().eq("id", id);
    setActionLoading(null);
    loadAll();
  }

  async function addHistoryMember(data: HistoryMemberDraft) {
    if (!historyMemberTargetYear) return;
    setSaving(true);
    await supabase
      .from("history_members")
      .insert([{ ...data, academic_year_id: historyMemberTargetYear }]);
    setSaving(false);
    setModal(null);
    setHistoryMemberTargetYear(null);
    loadAll();
  }

  async function updateHistoryMember(id: string, field: string, value: string) {
    setActionLoading(id);
    await supabase
      .from("history_members")
      .update({ [field]: value })
      .eq("id", id);
    setActionLoading(null);
    loadAll();
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

  // ── Photos ───────────────────────────────────────────────────────────────────

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
    <div className="mt-12 sm:mt-0 min-h-screen  bg-gray-950 overflow-hidden text-white">
      {/* Nav */}
      
      <div className="border-b border-gray-800 py-4 flex items-center sticky bg-gray-950 z-40">
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

          
      <div className="px-2 py-4 sm:p-8 max-w-7xl mx-auto">
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
            onEditMember={(member) => {
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
            onSave={addMember}
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
              name: editingMember.name,
              email: editingMember.email,
              phone: editingMember.phone,
              roll_number: editingMember.roll_number,
              year: editingMember.year,
              branch: editingMember.branch,
              domain: editingMember.domain,
              role: editingMember.role,
              instagram: editingMember.instagram,
              photo_url: editingMember.photo_url,
            }}
            onSave={(data) => updateMember(editingMember.id, data)}
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
          title="Add History Member"
          onClose={() => {
            setModal(null);
            setHistoryMemberTargetYear(null);
          }}
        >
          <div className="space-y-4">
            <div>
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
            </div>
            <HistoryMemberForm
              initial={emptyHistoryMember()}
              onSave={addHistoryMember}
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
