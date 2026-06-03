import { HistoryMemberCard } from "@/components/admin/dashboard/HistoryMemberCard";
import { SquircleIconButton } from "@/components/SquircleIconButton";
import { BookTextIcon } from "@/components/ui/BookTextIcon";
import { ChevronDownIcon } from "@/components/ui/ChevronDownIcon";
import { ChevronUpIcon } from "@/components/ui/ChevronUpIcon";
import { DeleteIcon } from "@/components/ui/DeleteIcon";
import { GalleryVerticalEndIcon } from "@/components/ui/GalleryVerticalEndIcon";
import { PlusIcon } from "@/components/ui/PlusIcon";
import { useState } from "react";
import { HistoryDrawer } from "../HistoryDrawer";

type AcademicYear = {
  id: string;
  label: string;
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
  is_active?: boolean;
};

type HistoryPhoto = {
  id: string;
  academic_year_id: string;
  cloudinary_url: string;
  caption?: string;
};

type HistorySectionProps = {
  academicYears: AcademicYear[];
  historyMembers: HistoryMember[];
  historyPhotos: HistoryPhoto[];
  expandedHistYear: string | null;
  actionLoading: string | null;
  yearLabel: (year: number) => string;
  onAddYear: () => void;
  onEditMember: (member: HistoryMember) => void;
  onToggleYear: (yearId: string) => void;
  onAddMember: (yearId: string) => void;
  onAddPhoto: (yearId: string) => void;
  onDeleteYear: (yearId: string) => void;
  onDeleteHistoryMember: (memberId: string) => void;
  onDeletePhoto: (photoId: string) => void;
};

export function HistorySection({
  academicYears,
  historyMembers,
  historyPhotos,
  expandedHistYear,
  actionLoading,
  yearLabel,
  onAddYear,
  onToggleYear,
  onAddMember,
  onAddPhoto,
  onDeleteYear,
  onDeleteHistoryMember,
  onDeletePhoto,
  onEditMember,
}: HistorySectionProps) {
  // 1. Add this state variable alongside your other modal definitions:
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const groupBadgeColor = (year: number) => {
    const map: Record<number, string> = {
      4: "text-yellow-300 bg-yellow-900/30 border-1 border-yellow-700",
      3: "text-blue-300 bg-blue-900/30 border-1 border-blue-700",
      2: "text-purple-300 bg-purple-900/30 border-1 border-purple-700",
      1: "text-green-300 bg-green-900/30 border-1 border-green-700",
    };
    return map[year] ?? "text-gray-300 bg-gray-800";
  };
  console.log("Rendering HistorySection with academicYears:", academicYears);
  console.log("Rendering HistorySection with historyMembers:", historyMembers);
  return (
    <div className="space-y-6">
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onEditMember={onEditMember}
      />
      <div className="flex mx-2 items-center justify-between">
        <h2 className="text-2xl font-bold">History</h2>
        <div className="flex items-center gap-3">
          <SquircleIconButton
            icon={<BookTextIcon size={18} className="text-black" />}
            label="View All History"
            onClick={() => setIsHistoryDrawerOpen(true)}
            bgColor="bg-white hover:bg-indigo-200"
            size="md"
          />
          <SquircleIconButton
            icon={<PlusIcon size={18} className="text-black" />}
            label="Add Academic Year"
            onClick={onAddYear}
            bgColor="bg-white hover:bg-indigo-200"
            size="md"
          />
        </div>
      </div>

      {academicYears.length === 0 && (
        <div className="text-center py-16 text-gray-600 bg-gray-900 rounded-2xl">
          No academic years yet. Add one to start building history.
        </div>
      )}

      <div className="space-y-4">
        {academicYears.map((year) => {
          const members = historyMembers.filter(
            (member: any) => member.academic_year === year.label,
          );

          const photos = historyPhotos.filter(
            (photo) => photo.academic_year_id === year.id,
          );

          const isOpen = expandedHistYear === year.id;

          const groupedMembers = [4, 3, 2, 1]
            .map((studyYear) => ({
              year: studyYear,
              label: yearLabel(studyYear),
              members: members.filter(
                (member: any) => member.year === studyYear,
              ),
            }))
            .filter((group) => group.members.length > 0);
          return (
            <div
              key={year.id}
              className="bg-gray-900 rounded-2xl overflow-visible"
            >
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-800/50 transition"
                onClick={() => onToggleYear(year.id)}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-bold text-base sm:text-lg text-white">
                    {year.label}
                  </span>
                  <span className="text-[11px] sm:text-xs text-gray-400">
                    {members.length} members
                  </span>
                  <span className="text-[11px] sm:text-xs text-gray-400">
                    {photos.length} photos
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <SquircleIconButton
                    icon={<PlusIcon size={16} />}
                    label="Add Member"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddMember(year.id);
                    }}
                    bgColor="bg-gray-700 hover:bg-gray-600"
                    size="sm"
                  />
                  <SquircleIconButton
                    icon={<GalleryVerticalEndIcon size={16} />}
                    label="Add Photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhoto(year.id);
                    }}
                    bgColor="bg-gray-700 hover:bg-gray-600"
                    size="sm"
                  />
                  <SquircleIconButton
                    icon={
                      actionLoading === year.id ? (
                        <span className="text-xs"></span>
                      ) : (
                        <DeleteIcon size={16} />
                      )
                    }
                    label="Delete Year"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteYear(year.id);
                    }}
                    disabled={actionLoading === year.id}
                    bgColor="bg-red-900/40 hover:bg-red-900/60 text-red-400"
                    size="sm"
                  />
                  <span className="text-gray-500">
                    {isOpen ? (
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
                  </span>{" "}
                </div>
              </div>

              {isOpen && (
                <div className="px-3 sm:px-6 pb-6 space-y-6 border-t border-gray-800">
                  <div className="pt-4">
                    <h3 className="text-sm pl-2 font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Team
                    </h3>
                    {members.length === 0 ? (
                      <p className="text-gray-600 text-sm">
                        No members recorded for this year.
                      </p>
                    ) : (
                      <div className="grid sm:px-0 grid-cols-1 lg:grid-cols-2 gap-6">
                        {groupedMembers.map((group) => (
                          <div
                            key={group.year}
                            className="rounded-2xl p-3 sm:p-5 bg-gray-800/40"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span
                                className={`text-sm font-bold px-3 py-1 rounded-full ${groupBadgeColor(group.year)}`}
                              >
                                {group.label}s &nbsp;{group.members.length}
                              </span>
                            </div>
                            <div className="space-y-2 ">
                              {group.members.map((member) => (
                                <HistoryMemberCard
                                  key={member.id}
                                  member={member}
                                  onEditMember={onEditMember}
                                  academicYearLabel={year.label}
                                  onDelete={() =>
                                    onDeleteHistoryMember(member.id)
                                  }
                                  loading={actionLoading === member.id}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Photos
                    </h3>
                    {photos.length === 0 ? (
                      <p className="text-gray-600 text-sm">
                        No photos yet. Click "+ Photo" to add.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="relative group rounded-xl overflow-hidden aspect-square bg-gray-800"
                          >
                            <img
                              src={photo.cloudinary_url}
                              alt={photo.caption || ""}
                              className="w-full h-full object-cover"
                            />
                            {photo.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs p-1 text-center truncate">
                                {photo.caption}
                              </div>
                            )}
                            <button
                              onClick={() => onDeletePhoto(photo.id)}
                              disabled={actionLoading === photo.id}
                              className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
