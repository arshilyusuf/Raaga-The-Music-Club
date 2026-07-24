import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const maxDuration = 5;

export async function GET(request: Request) {
  const rateLimit = enforceRateLimit(request, {
    key: "api:gallery:get",
    limit: 120,
    windowMs: 60_000,
    message: "Gallery is temporarily rate-limited. Please try again shortly.",
  });

  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const supabase = await createServerSupabaseClient();

  try {
    // 1. Fetch academic timelines and photos in parallel
    const [yearsResponse, photosResponse] = await Promise.all([
      supabase
        .from("academic_years")
        .select("id, label, start_year")
        .order("start_year", { ascending: false }),
      supabase
        .from("history_photos")
        // Assumes your database column is explicitly named 'date'
        .select("id, cloudinary_url, caption, academic_year_id, date")
        .order("date", { ascending: true }),
    ]);

    if (yearsResponse.error) throw yearsResponse.error;
    if (photosResponse.error) throw photosResponse.error;

    const academicYears = yearsResponse.data || [];
    const rawPhotos = photosResponse.data || [];

    const fallbackHeights = [
      400, 250, 600, 500, 300, 450, 350, 550, 480, 320, 600, 420, 470, 360, 510,
      580, 340, 440, 520, 380,
    ];

    // 2. Map photos dynamically into their respective academic year groups
    const dynamicGallery = academicYears
      .map((year) => {
        // Filter photos that belong to this specific academic_year_id
        const yearPhotos = rawPhotos
          .filter((photo) => photo.academic_year_id === year.id)
          .map((photo, index) => ({
            id: photo.id,
            img: photo.cloudinary_url,
            url: photo.cloudinary_url,
            caption: photo.caption,
            date: photo.date, // YYYY-MM-DD string value
            height: fallbackHeights[index % fallbackHeights.length],
          }));

        // Approximate a generic event display name based on the timeline label (e.g., "2024-25" -> "Shruti'24")
        const shortYear = year.label.split("-")[0].slice(-2);

        // ─── DYNAMIC DATE CALCULATION FOR YYYY-MM-DD ───────────────────────────
        let displayDate = `Cycle ${year.label}`;

        if (yearPhotos.length > 0) {
          // Sort or find the latest photo record based on the date string
          const latestPhoto = yearPhotos.reduce((latest, current) => {
            if (!current.date) return latest;
            if (!latest.date) return current;
            return current.date.localeCompare(latest.date) > 0
              ? current
              : latest;
          }, yearPhotos[0]);

          if (latestPhoto.date) {
            // Explicitly split elements to bypass local UTC offset rendering errors
            const [yearPart, monthPart, dayPart] = latestPhoto.date
              .split("-")
              .map(Number);

            // Create object instance using direct numerical constructors
            const parsedDate = new Date(yearPart, monthPart - 1, dayPart);

            displayDate = parsedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          }
        }
        // ───────────────────────────────────────────────────────────────────────

        return {
          id: year.id,
          yearLabel: year.label,
          eventName: `Shruti'${shortYear}`,
          date: displayDate,
          items: yearPhotos,
        };
      })
      .filter((group) => group.items.length > 0);

    return NextResponse.json(dynamicGallery, {
      headers: {
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=600, stale-if-error=86400",
        "CDN-Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=600, stale-if-error=86400",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
