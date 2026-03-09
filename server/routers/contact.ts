import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  boatName: z.string().optional(),
  boatLength: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const contactRouter = router({
  sendMessage: publicProcedure
    .input(contactMessageSchema)
    .mutation(async ({ input }) => {
      try {
        // Notify the owner about the new contact form submission
        const emailContent = `
New Contact Form Submission from Brandy's Cove Marina

Name: ${input.name}
Email: ${input.email}
Phone: ${input.phone || "Not provided"}
Boat Name: ${input.boatName || "Not provided"}
Boat Length: ${input.boatLength ? input.boatLength + " ft" : "Not provided"}

Message:
${input.message}

---
This message was submitted through the Brandy's Cove Marina pricing website.
Reply to: ${input.email}
        `.trim();

        await notifyOwner({
          title: `New Contact: ${input.name}`,
          content: emailContent,
        });

        return {
          success: true,
          message: "Your message has been sent successfully. We'll be in touch soon!",
        };
      } catch (error) {
        console.error("[Contact] Failed to send message:", error);
        throw new Error("Failed to send message. Please try again later.");
      }
    }),
});
