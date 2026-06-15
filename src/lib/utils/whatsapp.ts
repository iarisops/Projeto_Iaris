export function buildWhatsAppUrl(phone: string): string {
  // Strip non-numeric characters; keep leading + if present
  const clean = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  return `https://wa.me/${clean}`;
}
