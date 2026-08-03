import fs from "fs/promises";
import path from "path";

const isServer = typeof window === "undefined";


export async function fetchJson(relativePath) {
  if (isServer) {
    const filePath = path.join(process.cwd(), "public", "api", relativePath);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      return JSON.parse(raw);
    } catch (err) {
      console.error(`fetchJson failed for ${filePath}:`, err.message);
      throw err; // خليها تفشل بوضوح بدل ما ترجع undefined بصمت
    }
  }

  const res = await fetch(`/api/${relativePath}`);
  if (!res.ok) throw new Error(`Failed to fetch ${relativePath}`);
  return res.json();
}
