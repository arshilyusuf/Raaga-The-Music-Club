import React from "react";
import { FileTextIcon } from "@/components/ui/FileTextIcon";
import { SquircleIconButton } from "@/components/SquircleIconButton";
import { getSheetUrl } from "@/lib/actions/sheet";

type FilterType = "all" | "vocalist" | "instrumentalist";

type StatsFiltersProps = {
  registrationsCount: number;
  vocalistCount: number;
  instrumentalistCount: number;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
};

export function StatsFilters({
  registrationsCount,
  vocalistCount,
  instrumentalistCount,
  filter,
  onFilterChange,
}: StatsFiltersProps) {
  const items: Array<{
    key: FilterType;
    count: number;
    label: string;
  }> = [
    { key: "all", count: registrationsCount, label: "Total" },
    { key: "vocalist", count: vocalistCount, label: "Vocalists" },
    {
      key: "instrumentalist",
      count: instrumentalistCount,
      label: "Instrumentalists",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
      {items.map((item) => {
        const isTotal = item.key === "all";
        const isSelected = filter === item.key;

        return (
          <div
            key={item.key}
            onClick={() => onFilterChange(item.key)}
            className={`relative rounded-xl p-3 transition text-left ${
              isTotal ? "col-span-4" : "col-span-2"
            } ${
              isSelected
                ? "bg-white text-black"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {/* Squircle Action Shortcut Trigger Pinned to Top Right Corner */}
            {(item.key === "vocalist" || item.key === "instrumentalist") && (
              <div className="absolute top-2 right-2 z-10">
                <SquircleIconButton
                  size="sm"
                  label="Open in Sheets"
                  icon={<FileTextIcon />}
                  bgColor={
                    isSelected
                      ? " !text-gray-700 "
                      : " !text-gray-300  hover:!text-white"
                  }
                  onClick={async (e) => {
                    e.stopPropagation(); // Stops the active tab filter from toggling

                    try {
                      const targetUrl = await getSheetUrl(
                        item.key as "vocalist" | "instrumentalist",
                      );

                      if (targetUrl) {
                        window.open(targetUrl, "_blank", "noopener,noreferrer");
                      } else {
                        alert("Sheet URL configuration missing on server.");
                      }
                    } catch (err) {
                      console.error(
                        "Failed to retrieve redirect configuration:",
                        err,
                      );
                    }
                  }}
                />
              </div>
            )}

            <div className="text-base sm:text-2xl font-bold">{item.count}</div>
            <div
              className={`text-[1rem] sm:text-sm capitalize truncate ${
                isSelected ? "text-gray-800" : "text-gray-300"
              }`}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
