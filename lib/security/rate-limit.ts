import { NextResponse } from "next/server";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  message?: string;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();
const MAX_BUCKETS = 5_000;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const connectingIp =
    request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip");

  return connectingIp?.trim() || "unknown";
}

function pruneExpiredBuckets(now: number) {
  if (buckets.size < MAX_BUCKETS) {
    return;
  }

  for (const [bucketKey, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(bucketKey);
    }
  }
}

function createRateLimitResponse(message: string, retryAfterSeconds: number) {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

export function enforceRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const bucketKey = `${options.key}:${getClientIp(request)}`;
  const currentBucket = buckets.get(bucketKey);

  if (!currentBucket || currentBucket.resetAt <= now) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return { allowed: true as const };
  }

  if (currentBucket.count >= options.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((currentBucket.resetAt - now) / 1000),
    );

    return {
      allowed: false as const,
      response: createRateLimitResponse(
        options.message ?? "Too many requests. Please try again later.",
        retryAfterSeconds,
      ),
    };
  }

  currentBucket.count += 1;
  buckets.set(bucketKey, currentBucket);

  return { allowed: true as const };
}
