import { jest } from "@jest/globals";
import {
  CSRF_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  csrfProtection,
  createRateLimiter,
  escapeRegex,
  isSafeRemoteImageUrl,
  sanitizePublicUser,
} from "../../back-end/security.js";

const createResponse = () => ({
  statusCode: null,
  body: null,
  headers: {},
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
  setHeader(name, value) {
    this.headers[name] = value;
  },
});

describe("security helpers", () => {
  test("sanitizePublicUser removes sensitive fields", () => {
    const sanitized = sanitizePublicUser({
      _id: "u1",
      email: "user@test.local",
      password: "hash",
      resetToken: "reset",
      resetTokenExpiry: new Date(),
      __v: 0,
    });

    expect(sanitized).toEqual({
      _id: "u1",
      email: "user@test.local",
    });
  });

  test("escapeRegex escapes regex metacharacters", () => {
    expect(escapeRegex("Rio.*(Centro)?")).toBe("Rio\\.\\*\\(Centro\\)\\?");
  });

  test("isSafeRemoteImageUrl blocks local and private network targets", () => {
    expect(isSafeRemoteImageUrl("http://localhost/image.jpg")).toBe(false);
    expect(isSafeRemoteImageUrl("http://127.0.0.1/image.jpg")).toBe(false);
    expect(isSafeRemoteImageUrl("http://192.168.0.10/image.jpg")).toBe(false);
    expect(isSafeRemoteImageUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeRemoteImageUrl("https://images.example.com/photo.webp")).toBe(true);
  });
});

describe("csrfProtection middleware", () => {
  test("allows safe methods without token", () => {
    const req = { method: "GET", path: "/api/users/profile", cookies: {}, get: () => undefined };
    const res = createResponse();
    const next = jest.fn();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBeNull();
  });

  test("rejects state-changing cookie-authenticated requests without matching csrf token", () => {
    const req = {
      method: "POST",
      path: "/api/bookings",
      cookies: { [AUTH_COOKIE_NAME]: "jwt", [CSRF_COOKIE_NAME]: "csrf-cookie" },
      get: () => undefined,
    };
    const res = createResponse();
    const next = jest.fn();

    csrfProtection(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  test("allows state-changing requests with matching csrf token", () => {
    const req = {
      method: "POST",
      path: "/api/bookings",
      cookies: { [AUTH_COOKIE_NAME]: "jwt", [CSRF_COOKIE_NAME]: "csrf-token" },
      get: (name) => (name.toLowerCase() === "x-csrf-token" ? "csrf-token" : undefined),
    };
    const res = createResponse();
    const next = jest.fn();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("createRateLimiter middleware", () => {
  test("limits requests per key inside the configured window", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
    const req = { ip: "203.0.113.10", headers: {}, socket: {} };
    const first = createResponse();
    const second = createResponse();
    const third = createResponse();

    limiter(req, first, jest.fn());
    limiter(req, second, jest.fn());
    limiter(req, third, jest.fn());

    expect(third.statusCode).toBe(429);
    expect(third.body.error).toMatch(/Muitas requisicoes/);
  });
});
