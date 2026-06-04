import { NextResponse } from "next/server";

export async function GET() {
  const currentCalendarYear = new Date().getFullYear();
  const shortNextYear = String(currentCalendarYear + 1).slice(-2);
  const currentActiveAcademicYearStr = `${currentCalendarYear}-${shortNextYear}`;

  return NextResponse.json({ 
    academicYearStr: currentActiveAcademicYearStr 
  });
}