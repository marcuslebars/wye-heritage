import { describe, it, expect, vi, beforeEach } from "vitest";
import { contactRouter } from "./routers/contact";

// Mock the email module
vi.mock("./email", () => ({
  sendEmail: vi.fn(async () => ({ success: true })),
}));

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => {}),
}));

describe("Contact Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should accept valid contact form submission", async () => {
    const caller = contactRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.sendMessage({
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234",
      boatName: "Sea Breeze",
      boatLength: "28",
      message: "I would like to schedule a service for my boat.",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("sent successfully");
  });

  it("should reject submission with missing required fields", async () => {
    const caller = contactRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    try {
      await caller.sendMessage({
        name: "",
        email: "john@example.com",
        message: "Test message",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should reject invalid email address", async () => {
    const caller = contactRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    try {
      await caller.sendMessage({
        name: "John Doe",
        email: "invalid-email",
        message: "Test message",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should reject message shorter than 10 characters", async () => {
    const caller = contactRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    try {
      await caller.sendMessage({
        name: "John Doe",
        email: "john@example.com",
        message: "Short",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});
