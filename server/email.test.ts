import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendEmail } from "./email";

// Mock fetch globally
global.fetch = vi.fn();

describe("Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set environment variables
    process.env.EMAIL_SERVICE_PROVIDER = "resend";
    process.env.EMAIL_SERVICE_API_KEY = "test-api-key";
    process.env.EMAIL_FROM_ADDRESS = "noreply@a1marinecare.ca";
  });

  it("should send email successfully with valid configuration", async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "email-123" }),
    });

    const result = await sendEmail({
      to: "contact@a1marinecare.ca",
      subject: "Test Email",
      html: "<p>Test content</p>",
      text: "Test content",
    });

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("should return error when email service configuration is missing", async () => {
    process.env.EMAIL_SERVICE_PROVIDER = "";
    process.env.EMAIL_SERVICE_API_KEY = "";
    process.env.EMAIL_FROM_ADDRESS = "";

    const result = await sendEmail({
      to: "contact@a1marinecare.ca",
      subject: "Test Email",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle API errors gracefully", async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid API key" }),
    });

    const result = await sendEmail({
      to: "contact@a1marinecare.ca",
      subject: "Test Email",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should format email with proper structure", async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "email-123" }),
    });

    await sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<h1>Hello</h1>",
      text: "Hello",
    });

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toContain("api.resend.com");
    expect(callArgs[1].method).toBe("POST");
  });
});
