"use server";

export async function getSheetUrl(type: "vocalist" | "instrumentalist") {
  if (type === "vocalist") {
    return process.env.SHEET_URL_VOCALISTS || null;
  }
  if (type === "instrumentalist") {
    return process.env.SHEET_URL_INSTRUMENTALISTS || null;
  }
  return null;
}