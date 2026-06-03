import React, { useState, useEffect } from "react";

interface SearchMemberProps {
  onSelectMember: (member: any) => void;
}

export default function ExistingMemberSearch({
  onSelectMember,
}: SearchMemberProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // New State variables tracking pagination context
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    hasNextPage: false,
    hasPrevPage: false,
    totalPages: 1,
  });

  useEffect(() => {
    // Reset page back to 1 when a brand new search query string is typed
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Debounce API calls by 300ms to keep network traffic optimized
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        // Hits your newly updated Next.js internal API endpoint with explicit parameters
        const response = await fetch(
          `/api/members?page=${page}&search=${encodeURIComponent(query)}`,
        );
        const data = await response.json();

        if (data && data.members) {
          setResults(data.members); // Safely unwraps members array block out of wrapper
          setPaginationInfo({
            hasNextPage: data.pagination.hasNextPage,
            hasPrevPage: data.pagination.hasPrevPage,
            totalPages: data.pagination.totalPages,
          });
          setIsOpen(data.members.length > 0);
        } else {
          setResults([]);
          setIsOpen(false);
        }
      } catch (err) {
        console.error("Error fetching paginated members via API:", err);
        setResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, page]);

  return (
    <div className="relative z-50 mb-4 border-b border-gray-700/60 pb-4">
      <label className="text-xs font-semibold text-indigo-400 mb-1.5 block">
        Quick Add Existing Member
      </label>

      <div className="relative">
        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) setIsOpen(false);
          }}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
        />
        {loading && (
          <div className="absolute right-3 top-2.5 text-xs text-gray-500 animate-pulse">
            Searching...
          </div>
        )}
      </div>

      {/* Dynamic Results Floating Dropdown Menu Overlay */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden flex flex-col">
          <ul className="max-h-56 overflow-y-auto divide-y divide-gray-800">
            {results.map((member) => (
              <li key={member.membership_id || member.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectMember(member);
                    setQuery("");
                    /* Clear input on select - valid JSX comment style */
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-600/20 text-sm transition flex flex-col gap-0.5"
                >
                  <span className="font-medium text-white">{member.name}</span>
                  <span className="text-xs text-gray-400">
                    {member.roll_number ? `${member.roll_number} • ` : ""}
                    {member.branch || "No Branch listed"}
                    {member.academic_year
                      ? ` • ${member.academic_year}`
                      : ""}{" "}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* New: Footer Action Row handling Pagination Controls */}
          {paginationInfo.totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-950 border-t border-gray-800 text-xs text-gray-400">
              <span>
                Page {page} of {paginationInfo.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!paginationInfo.hasPrevPage}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-white transition font-medium"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={!paginationInfo.hasNextPage}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-white transition font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
