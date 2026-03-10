import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { sendEmail } from "../email";

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
        // Format the email content
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

        // Create HTML version for email
        const htmlContent = `
<html>
  <body style="font-family: Poppins, sans-serif; color: #333; line-height: 1.6;">
    <h2 style="color: #00e5ff;">New Contact Form Submission</h2>
    <p><strong>From:</strong> Brandy's Cove Marina Pricing Website</p>
    
    <h3 style="margin-top: 20px;">Contact Information</h3>
    <p><strong>Name:</strong> ${input.name}</p>
    <p><strong>Email:</strong> <a href="mailto:${input.email}">${input.email}</a></p>
    <p><strong>Phone:</strong> ${input.phone || "Not provided"}</p>
    
    <h3 style="margin-top: 20px;">Boat Information</h3>
    <p><strong>Boat Name:</strong> ${input.boatName || "Not provided"}</p>
    <p><strong>Boat Length:</strong> ${input.boatLength ? input.boatLength + " ft" : "Not provided"}</p>
    
    <h3 style="margin-top: 20px;">Message</h3>
    <p style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #00e5ff;">
      ${input.message.replace(/\n/g, "<br />")}
    </p>
    
    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
    <p style="color: #999; font-size: 12px;">
      This message was submitted through the Brandy's Cove Marina pricing website.
    </p>
  </body>
</html>
        `.trim();

        // Send email to contact@a1marinecare.ca
        const emailResult = await sendEmail({
          to: "contact@a1marinecare.ca",
          subject: `New Contact: ${input.name} - Brandy's Cove Marina`,
          html: htmlContent,
          text: emailContent,
        });

        // Also notify the owner
        await notifyOwner({
          title: `New Contact: ${input.name}`,
          content: emailContent,
        });

        if (!emailResult.success) {
          console.warn("[Contact] Email forwarding failed:", emailResult.error);
          // Don't fail the request if email forwarding fails, but log it
        }

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
