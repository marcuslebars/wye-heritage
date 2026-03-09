import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    boatName: "",
    boatLength: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const sendContactMutation = trpc.contact.sendMessage.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", boatName: "", boatLength: "", message: "" });
      setError("");
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: (err: any) => {
      setError(err?.message || "Failed to send message. Please try again.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields (name, email, message).");
      return;
    }

    sendContactMutation.mutate(formData);
  };

  return (
    <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
      <CardHeader>
        <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
          <Mail className="w-5 h-5" style={{ color: "#00e5ff" }} />
          Contact A1 Marine Care
        </CardTitle>
        <p className="text-sm text-white/50 mt-2">Send us a message and we'll get back to you within 24 hours.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-white/80 mb-1.5 block">Name *</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              style={{
                background: "oklch(0.14 0.006 240)",
                border: "1px solid oklch(1 0 0 / 12%)",
                color: "white"
              }}
              className="text-white placeholder:text-white/30"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-white/80 mb-1.5 block">Email *</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              style={{
                background: "oklch(0.14 0.006 240)",
                border: "1px solid oklch(1 0 0 / 12%)",
                color: "white"
              }}
              className="text-white placeholder:text-white/30"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-white/80 mb-1.5 block">Phone</label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              style={{
                background: "oklch(0.14 0.006 240)",
                border: "1px solid oklch(1 0 0 / 12%)",
                color: "white"
              }}
              className="text-white placeholder:text-white/30"
            />
          </div>

          {/* Boat Name */}
          <div>
            <label className="text-sm font-medium text-white/80 mb-1.5 block">Boat Name</label>
            <Input
              type="text"
              name="boatName"
              value={formData.boatName}
              onChange={handleChange}
              placeholder="e.g., Sea Breeze"
              style={{
                background: "oklch(0.14 0.006 240)",
                border: "1px solid oklch(1 0 0 / 12%)",
                color: "white"
              }}
              className="text-white placeholder:text-white/30"
            />
          </div>

          {/* Boat Length */}
          <div>
            <label className="text-sm font-medium text-white/80 mb-1.5 block">Boat Length (ft)</label>
            <Input
              type="text"
              name="boatLength"
              value={formData.boatLength}
              onChange={handleChange}
              placeholder="e.g., 28"
              style={{
                background: "oklch(0.14 0.006 240)",
                border: "1px solid oklch(1 0 0 / 12%)",
                color: "white"
              }}
              className="text-white placeholder:text-white/30"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-white/80 mb-1.5 block">Message *</label>
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your service needs..."
              rows={5}
              style={{
                background: "oklch(0.14 0.006 240)",
                border: "1px solid oklch(1 0 0 / 12%)",
                color: "white"
              }}
              className="text-white placeholder:text-white/30 resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(0.6 0.15 25 / 0.3)" }}>
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {submitted && (
            <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(0.85 0.18 195 / 0.3)" }}>
              <CheckCircle className="w-4 h-4" style={{ color: "#00e5ff" }} />
              <p className="text-sm text-white">Message sent successfully! We'll be in touch soon.</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={sendContactMutation.isPending}
            className="w-full font-semibold"
            style={{ background: "#00e5ff", color: "oklch(0.09 0.005 240)" }}
          >
            {sendContactMutation.isPending ? "Sending..." : "Send Message"}
          </Button>

          <p className="text-xs text-white/30 text-center">
            We'll respond to your inquiry at contact@a1marinecare.ca
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
