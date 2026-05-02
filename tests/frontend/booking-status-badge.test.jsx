import React from "react";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import BookingStatusBadge from "../../front-end/src/components/bookings/BookingStatusBadge.jsx";

describe("BookingStatusBadge", () => {
  test("renders the configured label and accessibility title", () => {
    render(<BookingStatusBadge status="confirmed" />);

    expect(screen.getByText("Confirmado")).toBeTruthy();
    expect(screen.getByTitle("Pagamento aprovado, pronto para check-in")).toBeTruthy();
  });

  test("falls back to pending label for unknown status", () => {
    render(<BookingStatusBadge status="unexpected" />);

    expect(screen.getByText("Pendente")).toBeTruthy();
  });
});

