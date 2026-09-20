/** Owner panel login / signup entry for "List Your Resort" CTAs. */
export function getOwnerPanelUrl(): string {
  return (
    process.env.NEXT_PUBLIC_OWNER_PANEL_URL ||
    "https://sun.genlenz.com/owner/login"
  ).replace(/\/$/, "");
}
