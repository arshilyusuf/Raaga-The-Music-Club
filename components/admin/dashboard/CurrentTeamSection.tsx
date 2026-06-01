import { SquircleIconButton } from "@/components/SquircleIconButton";
import { ChevronDownIcon } from "@/components/ui/ChevronDownIcon";
import { ChevronUpIcon } from "@/components/ui/ChevronUpIcon";
import { CornerDownRightIcon } from "@/components/ui/corner-down-right";
import { DeleteIcon } from "@/components/ui/DeleteIcon";
import { PlusIcon } from "@/components/ui/PlusIcon";
import { SquarePenIcon } from "@/components/ui/SquarePenIcon";

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

type TeamGroup = {
  year: number;
  label: string;
  members: TeamMember[];
};

type CurrentTeamSectionProps = {
  groupedTeam: TeamGroup[];
  otherDomainMembers: TeamMember[];
  teamMembersCount: number;
  expandedMember: string | null;
  actionLoading: string | null;
  yearColor: (year: number) => string;
  onToggleMember: (id: string) => void;
  onEditMember: (member: TeamMember) => void;
  onDeleteMember: (id: string) => void;
  onMoveToHistory: () => void;
  onAddMember: () => void;
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

export function CurrentTeamSection({
  groupedTeam,
  otherDomainMembers,
  teamMembersCount,
  expandedMember,
  actionLoading,
  yearColor,
  onToggleMember,
  onEditMember,
  onDeleteMember,
  onMoveToHistory,
  onAddMember,
}: CurrentTeamSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Current Team</h2>
        <div className="flex gap-3">
          <SquircleIconButton
            icon={<CornerDownRightIcon size={18} />}
            label="Move to History"
            onClick={onMoveToHistory}
            bgColor="bg-amber-700 hover:bg-amber-600" // Optional, can be changed dynamically
            size="md"
          />
          <SquircleIconButton
            icon={<PlusIcon size={18} className="text-black" />}
            label="Add Member"
            onClick={onAddMember}
            bgColor="bg-white hover:bg-indigo-200"
            size="md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groupedTeam.map((group) => (
          <div key={group.year} className="bg-gray-900 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${yearColor(group.year)}`}
              >
                {group.label}s &nbsp;{group.members.length}
              </span>
            </div>
            <div className="space-y-2">
              {group.members.map((member) => (
                <div key={member.id}>
                  <div
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-800/60 hover:bg-gray-800 cursor-pointer transition"
                    onClick={() => onToggleMember(member.id)}
                  >
                    <div className="flex items-center gap-3">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                          {member.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-400">
                          {member.role || member.domain}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SquircleIconButton
                        icon={<SquarePenIcon size={16} />}
                        label="Edit Member"
                        onClick={(e: any) => {
                          // If your SquircleIconButton passes the event through natively:
                          if (e?.stopPropagation) e.stopPropagation();
                          onEditMember(member);
                        }}
                        bgColor="bg-blue-900/40 hover:bg-blue-900/60 text-blue-400"
                        size="sm" // Using small size since your original design used a compact px-2 py-1 text-xs layout
                      />
                      <SquircleIconButton
                        icon={
                          actionLoading === member.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <DeleteIcon size={16} />
                          )
                        }
                        label="Delete Member"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMember(member.id);
                        }}
                        disabled={actionLoading === member.id}
                        bgColor="bg-red-900/40 hover:bg-red-900/60 text-red-400"
                        size="sm"
                      />
                      <span className="text-gray-600">
                        {expandedMember === member.id ? (
                          <ChevronUpIcon
                            size={16}
                            className="transition duration-200"
                          />
                        ) : (
                          <ChevronDownIcon
                            size={16}
                            className="transition duration-200"
                          />
                        )}
                      </span>
                    </div>
                  </div>

                  {expandedMember === member.id && (
                    <div className="mt-1 mb-2 px-4 py-3 bg-gray-800/30 rounded-xl text-xs grid grid-cols-2 gap-x-6 gap-y-2">
                      <D label="Admin Email" value={member.email} />
                      <D label="Phone" value={member.phone} />
                      <D label="Roll No." value={member.roll_number} />
                      <D label="Branch" value={member.branch} />
                      <D label="Domain" value={member.domain} />
                      <D
                        label="Instagram"
                        value={member.instagram}
                        isLink={true}
                      />{" "}
                      {member.photo_url && (
                        <div className="col-span-2">
                          <span className="text-gray-500 uppercase tracking-wide">
                            Photo URL
                          </span>
                          <p className="text-indigo-400 truncate">
                            {member.photo_url}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {otherDomainMembers.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold px-3 py-1 rounded-full text-orange-300 bg-orange-900/30">
                Other Domains — {otherDomainMembers.length}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {otherDomainMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-xl bg-gray-800/60 text-sm"
                >
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {member.domain} · {member.role || "—"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onEditMember(member)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteMember(member.id)}
                      disabled={actionLoading === member.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      {actionLoading === member.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {teamMembersCount === 0 && (
          <div className="lg:col-span-2 text-center py-16 text-gray-600 bg-gray-900 rounded-2xl">
            No team members yet. Click "Add Member" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
