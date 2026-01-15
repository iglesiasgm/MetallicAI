// apps/api/src/utils/notify.ts
export async function notifyAdmin(message: string) {
  const url = process.env.ADMIN_WEBHOOK_URL;
  if (!url) return;

  try {
    // Discord acepta { content: "..." }
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  } catch (e) {
    console.error("Failed to notify admin webhook:", e);
  }
}
