import { describe, expect, test } from "vitest";
import {
  BOOKING_STATUSES,
  getAllowedTransitions,
  getStatusConfig,
  isTransitionAllowed,
} from "../../front-end/src/lib/bookingStatuses.js";

describe("booking status utilities", () => {
  test("returns pending config as fallback for unknown status", () => {
    expect(getStatusConfig("unknown")).toBe(getStatusConfig(BOOKING_STATUSES.PENDING));
  });

  test("allows only declared booking transitions", () => {
    expect(isTransitionAllowed("pending", "confirmed")).toBe(true);
    expect(isTransitionAllowed("pending", "completed")).toBe(false);
    expect(isTransitionAllowed("completed", "canceled")).toBe(false);
  });

  test("lists available transitions for host/dashboard flows", () => {
    expect(getAllowedTransitions("confirmed")).toEqual(["in_progress", "canceled"]);
    expect(getAllowedTransitions("missing")).toEqual([]);
  });
});

