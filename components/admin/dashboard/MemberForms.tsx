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
};

type HistoryMemberFormData = {
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

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="mt-14 sm:mt-0 bg-gray-900 rounded-2xl w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <h2 className="font-bold text-lg text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl p-1"
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
  const [form, setForm] = useState(initial);
  const set = (key: string, value: any) =>
    setForm((current) => ({ ...current, [key]: value }));

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
        {
          label: "Role / Position",
          key: "role",
          element: "select",
          options: [
            { value: "", label: "Select Role" },
            { value: "Instrumentalist", label: "Instrumentalist" },
            { value: "Vocalist", label: "Vocalist" },
            { value: "Other", label: "Other" },
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
              value={(form as any)[field.key] ?? ""}
              onChange={(e) => set(field.key, e.target.value)}
              required={field.required}
              pattern={field.pattern}
              title={field.title}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Year of Study *
          </label>
          <select
            value={form.year}
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
          <label className="text-xs text-gray-400 mb-1 block">Domain *</label>
          <select
            value={form.domain}
            onChange={(e) => set("domain", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            {["musician", "management", "anchoring", "design", "other"].map(
              (domain) => (
                <option key={domain} value={domain}>
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
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

type HistoryMemberFormProps = {
  initial: HistoryMemberFormData;
  onSave: (data: HistoryMemberFormData) => void;
  onCancel: () => void;
  saving: boolean;
};

export function HistoryMemberForm({
  initial,
  onSave,
  onCancel,
  saving,
}: HistoryMemberFormProps) {
  const [form, setForm] = useState(initial);
  const set = (key: string, value: any) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
  <div className="space-y-3">
    {[
      { label: "Name *", key: "name", type: "text", required: true },
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
        limit: 10
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
        limit: 8
      },
      {
        label: "Branch",
        key: "branch",
        element: "select",
        options: [
          { value: "", label: "Select Branch" },
          { value: "Bio-Medical Engineering", label: "Bio-Medical Engineering" },
          { value: "Bio Technology", label: "Bio Technology" },
          { value: "Chemical Engineering", label: "Chemical Engineering" },
          { value: "Civil Engineering", label: "Civil Engineering" },
          { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
          { value: "Electronics and Communication Engineering", label: "Electronics and Communication Engineering" },
          { value: "Electrical Engineering", label: "Electrical Engineering" },
          { value: "Information Technology", label: "Information Technology" },
          { value: "Mechanical Engineering", label: "Mechanical Engineering" },
          { value: "Metallurgical and Materials Engineering", label: "Metallurgical and Materials Engineering" },
          { value: "Mining Engineering", label: "Mining Engineering" },
          { value: "B.Arch.", label: "B.Arch." },
          { value: "M.Tech.", label: "M.Tech." },
          { value: "MCA", label: "MCA" },
          { value: "M.Sc.", label: "M.Sc." },
        ],
      },
      {
        label: "Role / Position",
        key: "role",
        element: "select",
        options: [
          { value: "", label: "Select Role" },
          { value: "Instrumentalist", label: "Instrumentalist" },
          { value: "Vocalist", label: "Vocalist" },
          { value: "Other", label: "Other" },
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

    {/* Study Year and Domain Grid Blocks Layout */}
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">
          Year of Study *
        </label>
        <select
          value={form.study_year}
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
        <label className="text-xs text-gray-400 mb-1 block">Domain *</label>
        <select
          value={form.domain}
          onChange={(e) => set("domain", e.target.value)}
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
        >
          {["musician", "management", "anchoring", "design", "other"].map(
            (domain) => (
              <option key={domain} value={domain}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </option>
            ),
          )}
        </select>
      </div>
    </div>

    {/* Form Control Buttons Layer */}
    <div className="flex gap-3 pt-2">
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
