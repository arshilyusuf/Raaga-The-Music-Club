import { ChevronDownIcon } from "@/components/ui/ChevronDownIcon";
import { ChevronUpIcon } from "@/components/ui/ChevronUpIcon";

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

type ArchiveSectionProps = {
  archiveEntries: ArchiveEntry[];
  expandedArchYear: string | null;
  actionLoading: string | null;
  onToggleYear: (yearLabel: string) => void;
  onDeleteArchiveEntry: (entryId: string) => void;
};

export function ArchiveSection({
  archiveEntries,
  expandedArchYear,
  actionLoading,
  onToggleYear,
  onDeleteArchiveEntry,
}: ArchiveSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Audition Archive</h2>

      {archiveEntries.length === 0 && (
        <div className="text-center py-16 text-gray-600 bg-gray-900 rounded-2xl">
          No archived auditions yet. Use "Move to Archive" in the Auditions
          page.
        </div>
      )}

      {Array.from(
        new Set(archiveEntries.map((entry) => entry.academic_year_label)),
      ).map((yearLabel) => {
        const entries = archiveEntries.filter(
          (entry) => entry.academic_year_label === yearLabel,
        );
        const isOpen = expandedArchYear === yearLabel;

        return (
          <div
            key={yearLabel}
            className="bg-gray-900 rounded-2xl overflow-hidden"
          >
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-800/50 transition"
              onClick={() => onToggleYear(yearLabel)}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">{yearLabel}</span>
                <span className="text-xs text-gray-400">
                  {entries.length} registrations
                </span>
              </div>
              <span className="text-gray-500">
                {isOpen ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </span>{" "}
            </div>

            {isOpen && (
              <div className="border-t border-gray-800 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-800 text-gray-400 uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">Roll No.</th>
                      <th className="px-4 py-2 text-left">Branch</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Details</th>
                      <th className="px-4 py-2 text-left">Archived</th>

                      <th className="px-4 py-2 text-left"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-800/40">
                        <td className="px-4 py-2 font-medium">
                          {entry.full_name}
                        </td>
                        <td className="px-4 py-2 text-gray-400">
                          {entry.email || "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-400">
                          {entry.phone_number || "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-400">
                          {entry.roll_number || "—"}
                        </td>

                        <td className="px-4 py-2 text-gray-400">
                          {entry.branch || "—"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              entry.registration_type === "vocalist"
                                ? "bg-rose-900/50 text-rose-300"
                                : "bg-emerald-900/50 text-emerald-300"
                            }`}
                          >
                            {entry.registration_type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-400">
                          {entry.registration_type === "vocalist"
                            ? entry.languages || "—"
                            : (entry.instruments ?? []).join(", ") || "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-400">
                          {entry.archived_at
                            ? new Date(entry.archived_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => onDeleteArchiveEntry(entry.id)}
                            disabled={actionLoading === entry.id}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            {actionLoading === entry.id ? "..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
