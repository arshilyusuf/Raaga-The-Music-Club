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
    <div className="fixed inset-0 z-50 flex items-center justify-center h-full bg-black/70 backdrop-blur-sm p-4 display-block">
      <div className="mt-20 sm:mt-0 bg-gray-900 rounded-2xl w-full max-w-lg h-fit overflow-y-auto scrollbar-none">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 overflow-y-auto">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        <div className="px-6 py-5 mb-5 sm:mb-0">{children}</div>
      </div>
    </div>
  )
}

type MemberFormProps = {
  initial: TeamMemberFormData
  onSave: (data: TeamMemberFormData) => void
  onCancel: () => void
  saving: boolean
}

export function MemberForm({ initial, onSave, onCancel, saving }: MemberFormProps) {
  const [form, setForm] = useState(initial)
  const set = (key: string, value: any) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <div className="space-y-3">
      {[
        { label: "Name *", key: "name", type: "text", required: true },
        { label: "Email", key: "email", type: "email" },
        { label: "Phone", key: "phone", type: "tel" },
        { label: "Roll Number", key: "roll_number", type: "text" },
        { label: "Branch", key: "branch", type: "text" },
        { label: "Role / Position", key: "role", type: "text" },
        { label: "Instagram Handle", key: "instagram", type: "text" },
        { label: "Photo URL (Cloudinary)", key: "photo_url", type: "url" },
      ].map((field) => (
        <div key={field.key}>
          <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
          <input
            type={field.type}
            value={(form as any)[field.key] ?? ""}
            onChange={(e) => set(field.key, e.target.value)}
            required={field.required}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Year of Study *</label>
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
            {["musician", "management", "anchoring", "design", "other"].map((domain) => (
              <option key={domain} value={domain}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </option>
            ))}
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
  )
}

type HistoryMemberFormProps = {
  initial: HistoryMemberFormData
  onSave: (data: HistoryMemberFormData) => void
  onCancel: () => void
  saving: boolean
}

export function HistoryMemberForm({ initial, onSave, onCancel, saving }: HistoryMemberFormProps) {
  const [form, setForm] = useState(initial)
  const set = (key: string, value: any) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Email</label>
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Phone</label>
          <input
            type="tel"
            value={form.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Roll Number</label>
          <input
            type="text"
            value={form.roll_number ?? ""}
            onChange={(e) => set("roll_number", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Branch</label>
          <input
            type="text"
            value={form.branch ?? ""}
            onChange={(e) => set("branch", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Study Year *</label>
          <select
            value={form.study_year ?? 1}
            onChange={(e) => set("study_year", Number(e.target.value))}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            <option value={1}>1st Year</option>
            <option value={2}>2nd Year</option>
            <option value={3}>3rd Year</option>
            <option value={4}>4th Year</option>
            <option value={5}>5th Year</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Domain *</label>
          <select
            value={form.domain ?? "musician"}
            onChange={(e) => set("domain", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            {["musician", "management", "anchoring", "design", "other"].map((domain) => (
              <option key={domain} value={domain}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Role / Position</label>
          <input
            type="text"
            value={form.role ?? ""}
            onChange={(e) => set("role", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Instagram Handle</label>
          <input
            type="text"
            value={form.instagram ?? ""}
            onChange={(e) => set("instagram", e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Photo URL (Cloudinary)</label>
        <input
          type="url"
          value={form.photo_url ?? ""}
          onChange={(e) => set("photo_url", e.target.value)}
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
        />
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
  )
}