import { treaty } from "@elysiajs/eden";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

// parseDate: false — Eden otherwise heuristically converts "YYYY-MM-DD HH:MM:SS"
// strings (any hour except 00) into Date objects, which breaks .split() callers.
export const server = treaty<any>(apiUrl, { parseDate: false }) as any;
