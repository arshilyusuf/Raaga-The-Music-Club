import ExistingMemberSearch from "@/components/admin/ExistingMemberSearch";
import { useState } from "react";

type TeamMemberFormData = {
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
  academic_year?: string;
  is_active?: boolean;
};

type HistoryMemberFormData = {
  name: string;
  email?: string;
  phone?: string;
  roll_number?: string;
  study_year?: number;
  academic_year?: string;
  is_active?: boolean;
  branch?: string;
  domain?: string;
  role?: string;
  instagram?: string;
  photo_url?: string;
  year?: number; // Included to support both structural variations safely
  is_existing_member?: boolean;
  member_id?: string;
};

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  academicYearLabel?: string | null; // ◄── Add this line
};

export function Modal({
  title,
  onClose,
  children,
  academicYearLabel,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="mt-14 sm:mt-0 bg-gray-900 rounded-2xl w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="font-bold text-lg text-white truncate">{title}</h2>
            {academicYearLabel && (
              <span className="text-xs font-mono font-semibold bg-gray-900 border border-gray-800 px-2 py-0.5 rounded-md text-indigo-400 shrink-0">
                {academicYearLabel}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl p-1 transition ml-2"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Children Body Wrapper */}
        <div className="px-6 py-5 overflow-y-auto scrollbar-none flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

type MemberFormProps = {
  initial: TeamMemberFormData;
  onSave: (data: TeamMemberFormData) => void;
  onCancel: () => void;
  saving: boolean;
};

export function MemberForm({
  initial,
  onSave,
  onCancel,
  saving,
}: MemberFormProps) {
  const dynamicAcademicYears: string[] = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 2020; y--) {
    const shortNextYear = String(y + 1).slice(-2);
    const label = `${y}-${shortNextYear}`;
    dynamicAcademicYears.push(label);
  }
  const latestAcademicYear = dynamicAcademicYears[0] || "2026-27";

  const [form, setForm] = useState(() => ({
    academic_year: latestAcademicYear,
    is_active: true,
    ...initial,
  }));

  const set = (key: string, value: any) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Intercept domain state mutations to instantly re-assign dependent values
  const handleDomainChange = (newDomain: string) => {
    setForm((current) => ({
      ...current,
      domain: newDomain,
      // Fallback rule: Defaults field string tokens down to "Other" if domain shifts away from musician
      role:
        newDomain === "musician" ? current.role || "Instrumentalist" : "Other",
    }));
  };

  return (
    <div className="space-y-3">
      {[
        { label: "Name *", key: "name", type: "text", required: true },
        { label: "Email", key: "email", type: "email" },
        {
          label: "Phone *",
          key: "phone",
          type: "text",
          inputMode: "numeric",
          required: true,
          pattern: "[0-9]{10}",
          maxLength: 10,
          title: "Phone number must be exactly 10 digits",
          onlyNumbers: true,
          limit: 10,
        },
        {
          label: "Roll Number *",
          key: "roll_number",
          type: "text",
          inputMode: "numeric",
          required: true,
          pattern: "[0-9]{8}",
          maxLength: 8,
          title: "Roll number must be exactly 8 digits",
          onlyNumbers: true,
          limit: 8,
        },
        {
          label: "Branch",
          key: "branch",
          element: "select",
          options: [
            { value: "", label: "Select Branch" },
            {
              value: "Bio-Medical Engineering",
              label: "Bio-Medical Engineering",
            },
            { value: "Bio Technology", label: "Bio Technology" },
            { value: "Chemical Engineering", label: "Chemical Engineering" },
            { value: "Civil Engineering", label: "Civil Engineering" },
            {
              value: "Computer Science & Engineering",
              label: "Computer Science & Engineering",
            },
            {
              value: "Electronics and Communication Engineering",
              label: "Electronics and Communication Engineering",
            },
            {
              value: "Electrical Engineering",
              label: "Electrical Engineering",
            },
            {
              value: "Information Technology",
              label: "Information Technology",
            },
            {
              value: "Mechanical Engineering",
              label: "Mechanical Engineering",
            },
            {
              value: "Metallurgical and Materials Engineering",
              label: "Metallurgical and Materials Engineering",
            },
            { value: "Mining Engineering", label: "Mining Engineering" },
            { value: "B.Arch.", label: "B.Arch." },
            { value: "M.Tech.", label: "M.Tech." },
            { value: "MCA", label: "MCA" },
            { value: "M.Sc.", label: "M.Sc." },
          ],
        },
        { label: "Instagram Handle", key: "instagram", type: "text" },
        { label: "Photo URL (Cloudinary)", key: "photo_url", type: "url" },
      ].map((field) => (
        <div key={field.key}>
          <label className="text-xs text-gray-400 mb-1 block">
            {field.label}
          </label>

          {field.element === "select" ? (
            <select
              value={(form as any)[field.key] ?? ""}
              onChange={(e) => set(field.key, e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
            >
              {field.options?.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-gray-900"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              inputMode={field.inputMode as any}
              maxLength={field.maxLength}
              value={(form as any)[field.key] ?? ""}
              onChange={(e) => {
                let val = e.target.value;
                if (field.onlyNumbers) {
                  val = val.replace(/\D/g, "");
                  if (field.limit && val.length > field.limit) {
                    val = val.slice(0, field.limit);
                  }
                }
                set(field.key, val);
              }}
              required={field.required}
              pattern={field.pattern}
              title={field.title}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </div>
      ))}

      {/* Structural Metadata Selection Grid Rows (Swapped Order) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Domain *</label>
          <select
            value={form.domain}
            onChange={(e) => handleDomainChange(e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            {["musician", "management", "anchoring", "design"].map((domain) => (
              <option key={domain} value={domain}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Role / Position {form.domain !== "musician" && "(Locked)"}
          </label>
          <select
            value={form.role ?? "Other"}
            disabled={form.domain !== "musician"}
            onChange={(e) => set("role", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form.domain === "musician" ? (
              <>
                <option value="Instrumentalist">Instrumentalist</option>
                <option value="Vocalist">Vocalist</option>
              </>
            ) : (
              <option value="Other">Other</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Year of Study *
          </label>
          <select
            value={form.year || 1}
            onChange={(e) => set("year", Number(e.target.value))}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            <option value={1}>1st Year (Member)</option>
            <option value={2}>2nd Year (Executive)</option>
            <option value={3}>3rd Year (Core Coordinator)</option>
            <option value={4}>4th Year (Head Coordinator)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Academic Year *
          </label>
          <select
            value={form.academic_year || latestAcademicYear}
            onChange={(e) => set("academic_year", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {dynamicAcademicYears.map((yearStr, index) => (
              <option key={yearStr} value={yearStr}>
                {yearStr} {index === 0 ? "(Current)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Indicator Dot Control */}
      <div className="pt-1">
        <label className="text-xs text-gray-400 mb-2 block">
          Active Status
        </label>
        <button
          type="button"
          onClick={() =>
            set("is_active", form.is_active === false ? true : false)
          }
          className="flex items-center gap-2 w-full bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white transition text-left outline-none"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
              form.is_active !== false
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : "bg-gray-500"
            }`}
          />
          <span className="text-xs font-medium">
            {form.is_active !== false
              ? "Active Team Member"
              : "Inactive / Alumni"}
          </span>
        </button>
      </div>

      {/* Form Control Buttons Layer */}
      <div className="flex gap-3 pt-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg py-2 text-sm font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
export function MemberAddForm({
  initial,
  onSave,
  onCancel,
  saving,
}: MemberFormProps) {
  const dynamicAcademicYears: string[] = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 2020; y--) {
    const shortNextYear = String(y + 1).slice(-2);
    const label = `${y}-${shortNextYear}`;
    dynamicAcademicYears.push(label);
  }
  const latestAcademicYear = dynamicAcademicYears[0] || "2026-27";

  const [form, setForm] = useState(() => ({
    academic_year: latestAcademicYear,
    ...initial,
  }));

  const set = (key: string, value: any) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Intercept domain state mutations to instantly re-assign dependent values
  const handleDomainChange = (newDomain: string) => {
    setForm((current) => ({
      ...current,
      domain: newDomain,
      // Fallback rule: Defaults field string tokens down to "Other" if domain shifts away from musician
      role:
        newDomain === "musician" ? current.role || "Instrumentalist" : "Other",
    }));
  };

  return (
    <div className="space-y-3">
      <ExistingMemberSearch
        onSelectMember={(member) => {
          setForm((current) => ({
            ...current,
            // Spread out the fields fetched from the database
            name: member.name || "",
            email: member.email || "",
            phone: member.phone || "",
            roll_number: member.roll_number || "",
            branch: member.branch || "",
            instagram: member.instagram || "",
            photo_url: member.photo_url || "",
            // Set relational control flags so your POST request knows it is an existing profile
            is_existing_member: true,
            member_id: member.id,
          }));
        }}
      />
      {[
        { label: "Name *", key: "name", type: "text", required: true },
        { label: "Email", key: "email", type: "email" },
        {
          label: "Phone *",
          key: "phone",
          type: "text",
          inputMode: "numeric",
          required: true,
          pattern: "[0-9]{10}",
          maxLength: 10,
          title: "Phone number must be exactly 10 digits",
          onlyNumbers: true,
          limit: 10,
        },
        {
          label: "Roll Number *",
          key: "roll_number",
          type: "text",
          inputMode: "numeric",
          required: true,
          pattern: "[0-9]{8}",
          maxLength: 8,
          title: "Roll number must be exactly 8 digits",
          onlyNumbers: true,
          limit: 8,
        },
        {
          label: "Branch",
          key: "branch",
          element: "select",
          options: [
            { value: "", label: "Select Branch" },
            {
              value: "Bio-Medical Engineering",
              label: "Bio-Medical Engineering",
            },
            { value: "Bio Technology", label: "Bio Technology" },
            { value: "Chemical Engineering", label: "Chemical Engineering" },
            { value: "Civil Engineering", label: "Civil Engineering" },
            {
              value: "Computer Science & Engineering",
              label: "Computer Science & Engineering",
            },
            {
              value: "Electronics and Communication Engineering",
              label: "Electronics and Communication Engineering",
            },
            {
              value: "Electrical Engineering",
              label: "Electrical Engineering",
            },
            {
              value: "Information Technology",
              label: "Information Technology",
            },
            {
              value: "Mechanical Engineering",
              label: "Mechanical Engineering",
            },
            {
              value: "Metallurgical and Materials Engineering",
              label: "Metallurgical and Materials Engineering",
            },
            { value: "Mining Engineering", label: "Mining Engineering" },
            { value: "B.Arch.", label: "B.Arch." },
            { value: "M.Tech.", label: "M.Tech." },
            { value: "MCA", label: "MCA" },
            { value: "M.Sc.", label: "M.Sc." },
          ],
        },
        { label: "Instagram Handle", key: "instagram", type: "text" },
        { label: "Photo URL (Cloudinary)", key: "photo_url", type: "url" },
      ].map((field) => (
        <div key={field.key}>
          <label className="text-xs text-gray-400 mb-1 block">
            {field.label}
          </label>

          {field.element === "select" ? (
            <select
              value={(form as any)[field.key] ?? ""}
              onChange={(e) => set(field.key, e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
            >
              {field.options?.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-gray-900"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              inputMode={field.inputMode as any}
              maxLength={field.maxLength}
              value={(form as any)[field.key] ?? ""}
              onChange={(e) => {
                let val = e.target.value;
                if (field.onlyNumbers) {
                  val = val.replace(/\D/g, "");
                  if (field.limit && val.length > field.limit) {
                    val = val.slice(0, field.limit);
                  }
                }
                set(field.key, val);
              }}
              required={field.required}
              pattern={field.pattern}
              title={field.title}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </div>
      ))}

      {/* Structural Metadata Selection Grid Rows (Swapped Order) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Domain *</label>
          <select
            value={form.domain}
            onChange={(e) => handleDomainChange(e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            {["musician", "management", "anchoring", "design"].map((domain) => (
              <option key={domain} value={domain}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Role / Position {form.domain !== "musician" && "(Locked)"}
          </label>
          <select
            value={form.role ?? "Other"}
            disabled={form.domain !== "musician"}
            onChange={(e) => set("role", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form.domain === "musician" ? (
              <>
                <option value="Instrumentalist">Instrumentalist</option>
                <option value="Vocalist">Vocalist</option>
              </>
            ) : (
              <option value="Other">Other</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Year of Study *
          </label>
          <select
            value={form.year || 1}
            onChange={(e) => set("year", Number(e.target.value))}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            <option value={1}>1st Year (Member)</option>
            <option value={2}>2nd Year (Executive)</option>
            <option value={3}>3rd Year (Core Coordinator)</option>
            <option value={4}>4th Year (Head Coordinator)</option>
            <option value={5}>5th Year</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Academic Year *
          </label>
          <select
            value={form.academic_year || latestAcademicYear}
            onChange={(e) => set("academic_year", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {dynamicAcademicYears.map((yearStr, index) => (
              <option key={yearStr} value={yearStr}>
                {yearStr} {index === 0 ? "(Current)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Control Buttons Layer */}
      <div className="flex gap-3 pt-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg py-2 text-sm font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
type MasterEditFormProps = {
  initial: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
};
export function MasterEditForm({
  initial,
  onSave,
  onCancel,
  saving,
}: MasterEditFormProps) {
  const [form, setForm] = useState(() => ({
    is_active: true,
    ...initial,
  }));
  const set = (key: string, value: any) =>
    setForm((current: HistoryMemberFormData) => ({ ...current, [key]: value }));

  // 2. Explicitly type the specialized domain handler parameter
  const handleDomainChange = (newDomain: string) => {
    setForm((current: HistoryMemberFormData) => ({
      ...current,
      domain: newDomain,
      role:
        newDomain === "musician" ? current.role || "Instrumentalist" : "Other",
    }));
  };

  return (
    <div className="space-y-3">
      {[
        { label: "Name *", key: "name", type: "text", required: true },
        { label: "Email", key: "email", type: "email" },
        {
          label: "Phone *",
          key: "phone",
          type: "text",
          inputMode: "numeric",
          required: true,
          pattern: "[0-9]{10}",
          maxLength: 10,
          title: "Phone number must be exactly 10 digits",
          onlyNumbers: true,
          limit: 10,
        },
        {
          label: "Roll Number *",
          key: "roll_number",
          type: "text",
          inputMode: "numeric",
          required: true,
          pattern: "[0-9]{8}",
          maxLength: 8,
          title: "Roll number must be exactly 8 digits",
          onlyNumbers: true,
          limit: 8,
        },
        {
          label: "Branch",
          key: "branch",
          element: "select",
          options: [
            { value: "", label: "Select Branch" },
            {
              value: "Bio-Medical Engineering",
              label: "Bio-Medical Engineering",
            },
            { value: "Bio Technology", label: "Bio Technology" },
            { value: "Chemical Engineering", label: "Chemical Engineering" },
            { value: "Civil Engineering", label: "Civil Engineering" },
            {
              value: "Computer Science & Engineering",
              label: "Computer Science & Engineering",
            },
            {
              value: "Electronics and Communication Engineering",
              label: "Electronics and Communication Engineering",
            },
            {
              value: "Electrical Engineering",
              label: "Electrical Engineering",
            },
            {
              value: "Information Technology",
              label: "Information Technology",
            },
            {
              value: "Mechanical Engineering",
              label: "Mechanical Engineering",
            },
            {
              value: "Metallurgical and Materials Engineering",
              label: "Metallurgical and Materials Engineering",
            },
            { value: "Mining Engineering", label: "Mining Engineering" },
            { value: "B.Arch.", label: "B.Arch." },
            { value: "M.Tech.", label: "M.Tech." },
            { value: "MCA", label: "MCA" },
            { value: "M.Sc.", label: "M.Sc." },
          ],
        },
        { label: "Instagram Handle", key: "instagram", type: "text" },
        { label: "Photo URL (Cloudinary)", key: "photo_url", type: "url" },
      ].map((field) => (
        <div key={field.key}>
          <label className="text-xs text-gray-400 mb-1 block">
            {field.label}
          </label>

          {field.element === "select" ? (
            <select
              value={(form as any)[field.key] ?? ""}
              onChange={(e) => set(field.key, e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
            >
              {field.options?.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-gray-900"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              inputMode={field.inputMode as any}
              maxLength={field.maxLength}
              value={(form as any)[field.key] ?? ""}
              onChange={(e) => {
                let val = e.target.value;
                if (field.onlyNumbers) {
                  val = val.replace(/\D/g, "");
                  if (field.limit && val.length > field.limit) {
                    val = val.slice(0, field.limit);
                  }
                }
                set(field.key, val);
              }}
              required={field.required}
              pattern={field.pattern}
              title={field.title}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </div>
      ))}

      {/* Structural Metadata Selection Grid Rows */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Domain *</label>
          <select
            value={form.domain}
            onChange={(e) => handleDomainChange(e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            {["musician", "management", "anchoring", "design"].map((domain) => (
              <option key={domain} value={domain}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Role / Position {form.domain !== "musician" && "(Locked)"}
          </label>
          <select
            value={form.role ?? "Other"}
            disabled={form.domain !== "musician"}
            onChange={(e) => set("role", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form.domain === "musician" ? (
              <>
                <option value="Instrumentalist">Instrumentalist</option>
                <option value="Vocalist">Vocalist</option>
              </>
            ) : (
              <option value="Other">Other</option>
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">
          Current Year of Study *
        </label>
        <select
          value={form.year || 1}
          onChange={(e) => set("year", Number(e.target.value))}
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
        >
          <option value={1}>1st Year (Member)</option>
          <option value={2}>2nd Year (Executive)</option>
          <option value={3}>3rd Year (Core Coordinator)</option>
          <option value={4}>4th Year (Head Coordinator)</option>
        </select>
      </div>

      {/* Status Indicator Dot Control */}
      <div className="pt-1">
        <label className="text-xs text-gray-400 mb-2 block">
          Active Status
        </label>
        <button
          type="button"
          onClick={() =>
            set("is_active", form.is_active === false ? true : false)
          }
          className="flex items-center gap-2 w-full bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white transition text-left outline-none"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
              form.is_active !== false
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : "bg-gray-500"
            }`}
          />
          <span className="text-xs font-medium">
            {form.is_active !== false
              ? "Active Team Member"
              : "Inactive / Alumni"}
          </span>
        </button>
      </div>

      {/* Form Control Buttons Layer */}
      <div className="flex gap-3 pt-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg py-2 text-sm font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

type HistoryMemberAddFormProps = {
  initial: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
  academicYears: any[];
  academicYearLabel?: string | null; // ◄── Add this line
};

export function HistoryMemberAddForm({
  initial,
  onSave,
  onCancel,
  saving,
}: HistoryMemberAddFormProps) {
  const [form, setForm] = useState<HistoryMemberFormData>(initial);

  const set = (key: string, value: any) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Flag to check if the profile has been pulled as an existing master database profile entry
  const isExisting = !!form.is_existing_member;

  const handleDomainChange = (newDomain: string) => {
    setForm((current) => ({
      ...current,
      domain: newDomain,
      role:
        newDomain === "musician" ? current.role || "Instrumentalist" : "Other",
    }));
  };

  return (
    <div className="space-y-3">
      {/* 1. Existing Member Search Bar Layer */}
      <ExistingMemberSearch
        onSelectMember={(member) => {
          setForm((current) => ({
            ...current,
            name: member.name || "",
            email: member.email || "",
            phone: member.phone || "",
            roll_number: member.roll_number || "",
            branch: member.branch || "",
            instagram: member.instagram || "",
            photo_url: member.photo_url || "",
            domain: member.domain || "musician",
            role: member.role || "Other",
            // Set relational control flags so your request context logic targets only club_memberships
            is_existing_member: true,
            member_id: member.id,
          }));
        }}
      />

      {/* 2. Standard Form Field Input Loops (Disabled dynamically if profile exists) */}
      {[
        { label: "Name *", key: "name", type: "text", required: !isExisting },
        { label: "Email", key: "email", type: "email" },
        {
          label: "Phone",
          key: "phone",
          type: "text",
          inputMode: "numeric",
          required: false,
          pattern: "[0-9]{10}",
          maxLength: 10,
          title: "Phone number must be exactly 10 digits",
          onlyNumbers: true,
          limit: 10,
        },
        {
          label: "Roll Number",
          key: "roll_number",
          type: "text",
          inputMode: "numeric",
          required: false,
          pattern: "[0-9]{8}",
          maxLength: 8,
          title: "Roll number must be exactly 8 digits",
          onlyNumbers: true,
          limit: 8,
        },
        {
          label: "Branch",
          key: "branch",
          element: "select",
          options: [
            { value: "", label: "Select Branch" },
            {
              value: "Bio-Medical Engineering",
              label: "Bio-Medical Engineering",
            },
            { value: "Bio Technology", label: "Bio Technology" },
            { value: "Chemical Engineering", label: "Chemical Engineering" },
            { value: "Civil Engineering", label: "Civil Engineering" },
            {
              value: "Computer Science & Engineering",
              label: "Computer Science & Engineering",
            },
            {
              value: "Electronics and Communication Engineering",
              label: "Electronics and Communication Engineering",
            },
            {
              value: "Electrical Engineering",
              label: "Electrical Engineering",
            },
            {
              value: "Information Technology",
              label: "Information Technology",
            },
            {
              value: "Mechanical Engineering",
              label: "Mechanical Engineering",
            },
            {
              value: "Metallurgical and Materials Engineering",
              label: "Metallurgical and Materials Engineering",
            },
            { value: "Mining Engineering", label: "Mining Engineering" },
            { value: "B.Arch.", label: "B.Arch." },
            { value: "M.Tech.", label: "M.Tech." },
            { value: "MCA", label: "MCA" },
            { value: "M.Sc.", label: "M.Sc." },
          ],
        },
        { label: "Instagram Handle", key: "instagram", type: "text" },
        { label: "Photo URL (Cloudinary)", key: "photo_url", type: "url" },
      ].map((field) => (
        <div key={field.key} className={isExisting ? "opacity-60" : ""}>
          <label className="text-xs text-gray-400 mb-1 block">
            {field.label}{" "}
            {isExisting && field.key !== "roll_number" && "(Profile Locked)"}
          </label>

          {field.element === "select" ? (
            <select
              value={(form as any)[field.key] ?? ""}
              disabled={isExisting}
              onChange={(e) => set(field.key, e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 appearance-none disabled:cursor-not-allowed"
            >
              {field.options?.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-gray-900"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              disabled={isExisting}
              inputMode={field.inputMode as any}
              maxLength={field.maxLength}
              value={(form as any)[field.key] ?? ""}
              onChange={(e) => {
                let val = e.target.value;
                if (field.onlyNumbers) {
                  val = val.replace(/\D/g, "");
                  if (field.limit && val.length > field.limit) {
                    val = val.slice(0, field.limit);
                  }
                }
                set(field.key, val);
              }}
              required={field.required}
              pattern={field.pattern}
              title={field.title}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed"
            />
          )}
        </div>
      ))}

      {/* Structural Metadata Selection Grid Rows (Always Enabled for Timeline Configurations) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Domain *</label>
          <select
            value={form.domain || "musician"}
            onChange={(e) => handleDomainChange(e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            {["musician", "management", "anchoring", "design"].map((domain) => (
              <option key={domain} value={domain}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Role / Position {form.domain !== "musician" && "(Locked)"}
          </label>
          <select
            value={form.role ?? "Other"}
            disabled={form.domain !== "musician"}
            onChange={(e) => set("role", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form.domain === "musician" ? (
              <>
                <option value="Instrumentalist">Instrumentalist</option>
                <option value="Vocalist">Vocalist</option>
                <option value="Other">Other</option>
              </>
            ) : (
              <option value="Other">Other</option>
            )}
          </select>
        </div>
      </div>

      {/* Year of Study Selection and Profile Active Status Control */}
      <div className="grid grid-cols-2 gap-3 items-end pt-1">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Year of Study *
          </label>
          <select
            value={form.study_year || form.year || 1}
            onChange={(e) => set("study_year", Number(e.target.value))}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            <option value={1}>1st Year (Member)</option>
            <option value={2}>2nd Year (Executive)</option>
            <option value={3}>3rd Year (Core Coordinator)</option>
            <option value={4}>4th Year (Head Coordinator)</option>
            <option value={5}>5th Year</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-2 block">
            Active Status {isExisting && "(Controlled via Profile Dashboard)"}
          </label>
          <button
            type="button"
            disabled={isExisting}
            onClick={() => set("is_active", !form.is_active)}
            className="flex items-center gap-2 w-full bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white transition text-left outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                form.is_active
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "bg-gray-500"
              }`}
            />
            <span className="text-xs font-medium">
              {form.is_active ? "Active Team Member" : "Inactive / Alumni"}
            </span>
          </button>
        </div>
      </div>

      {/* Form Control Buttons Layer */}
      <div className="flex gap-3 pt-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg py-2 text-sm font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
