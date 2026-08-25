
// Simple in-memory rate limiter with no external service.
// Each visitor is identified by IP and keeps a list of recent request times.
//
// Known limitation: each edge function instance has its own request count.
// Multiple active instances can therefore allow more requests than configured.
// That is acceptable for this portfolio project, but not for high-scale production.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const requestLog = new Map<string, number[]>();

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const timestamps = requestLog.get(ip) ?? [];
  const recentTimestamps = timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(ip, recentTimestamps);
    return { allowed: false, remaining: 0 };
  }

  recentTimestamps.push(now);
  requestLog.set(ip, recentTimestamps);

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - recentTimestamps.length,
  };
}

export const MAX_MESSAGE_LENGTH = 2000;

export function isMessageTooLong(text: string): boolean {
  return text.length > MAX_MESSAGE_LENGTH;
}

