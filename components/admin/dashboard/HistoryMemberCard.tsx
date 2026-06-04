import { SquircleIconButton } from "@/components/SquircleIconButton";
import { ChevronDownIcon } from "@/components/ui/ChevronDownIcon";
import { ChevronUpIcon } from "@/components/ui/ChevronUpIcon";
import { DeleteIcon } from "@/components/ui/DeleteIcon";
import { SquarePenIcon } from "@/components/ui/SquarePenIcon";
import { useState } from "react";

// 1. Force the layout schema type to retain tracking IDs matching the dashboard structures
type HistoryMemberCardMember = {
  id: string;              // Added
  academic_year_id: string; // Added
  name: string;
  email?: string;
  phone?: string;
  roll_number?: string;
  branch?: string;
  instagram?: string;
  role?: string;
  domain?: string;
  photo_url?: string;
  study_year?: number;
  year?: number;           // Added to prevent dynamic property mapping errors
  is_active?: boolean;
};

type HistoryMemberCardProps = {
  member: HistoryMemberCardMember;
  academicYearLabel: string;
  onDelete: () => void;
  // This signature now cleanly aligns with HistorySectionProps
  onEditMember: (member: HistoryMemberCardMember) => void; 
  loading: boolean;
};

function D({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value?: string | null;
  isLink?: boolean;
}) {
  const containerClasses =
    "text-white text-sm truncate block max-w-[160px] sm:max-w-[220px]";
  const fallback = <span className="text-gray-600">—</span>;

  return (
    <div className="min-w-0">
      <span className="text-gray-500 uppercase tracking-wide text-[10px] block">
        {label}
      </span>

      {value && isLink ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${containerClasses} text-indigo-400 hover:underline hover:text-indigo-300`}
          title={value}
        >
          {value}
        </a>
      ) : (
        <p className={containerClasses} title={value || undefined}>
          {value || fallback}
        </p>
      )}
    </div>
  );
}

export function HistoryMemberCard({
  member,
  academicYearLabel,
  onEditMember,
  onDelete,
  loading,
}: HistoryMemberCardProps) {
  const [expanded, setExpanded] = useState(false);
  const studyYearLabel = member.study_year
    ? `${member.study_year}${member.study_year === 1 ? "st" : member.study_year === 2 ? "nd" : member.study_year === 3 ? "rd" : "th"} Year`
    : "—";

  return (
    <div className="rounded-xl  bg-gray-800/60 p-3 transition hover:bg-gray-800">
      <div className="flex  items-center justify-between gap-2">
        <button
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={() => setExpanded(!expanded)}
        >
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={member.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs font-bold">
              {member.name[0]}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate font-medium text-sm">{member.name}</p>
              <div
                className={`w-2 h-2 rounded-full shrink-0 ml-1.5 transition-colors duration-300 ${
                  member.is_active
                    ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                    : "bg-gray-500"
                }`}
              />
            </div>
            <p className="truncate text-xs text-gray-400 capitalize">
              {member.role || member.domain || "—"}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <SquircleIconButton
            icon={
              loading ? (
                <span className="text-xs">...</span>
              ) : (
                <DeleteIcon size={16} />
              )
            }
            label="Delete"
            onClick={onDelete}
            disabled={loading}
            bgColor="bg-red-900/40 hover:bg-red-900/60 text-red-400"
            size="sm"
          />
          {/* <SquircleIconButton
            icon={<SquarePenIcon size={16} />}
            label="Edit Member"
            // Pass the current member object into the handler function on click
            onClick={(e: any) => {
              if (e?.stopPropagation) e.stopPropagation(); // Prevents row expansion toggles
              onEditMember(member);
            }}
            disabled={loading}
            bgColor="bg-blue-900/40 hover:bg-blue-900/60 text-blue-400"
            size="sm"
          /> */}
          <span className="text-gray-600">
            {expanded ? (
              <ChevronUpIcon
                size={14}
                className="transition duration-200 "
                onClick={() => setExpanded(!expanded)}
              />
            ) : (
              <ChevronDownIcon
                size={14}
                className="transition duration-200"
                onClick={() => setExpanded(!expanded)}
              />
            )}
          </span>{" "}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5"></div>
      {expanded && (
        <div className="mt-2 space-y-1  border-t border-gray-700 pt-2">
          <D label="Email" value={member.email} />
          <D label="Phone" value={member.phone} />
          <D label="Roll No." value={member.roll_number} />
          <D label="Branch" value={member.branch} />
          <D label="Instagram" value={member.instagram} isLink={true} />
        </div>
      )}
    </div>
  );
}
