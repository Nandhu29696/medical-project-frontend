import { z } from "zod";

export const enquirySchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().optional(),
  phone: z
    .string()
    .min(7, "Enter a valid mobile number.")
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid mobile number."),
  email: z.string().email("Enter a valid email address.").optional().or(z.literal("")),
  city: z.string().optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  message: z.string().optional(),
  preferred_contact_method: z.enum(["PHONE", "WHATSAPP"]).default("PHONE"),
  consent_given: z.literal(true, {
    errorMap: () => ({ message: "Please provide consent to be contacted." }),
  }),
  // Honeypot — must stay empty; real users never see this field.
  website: z.string().max(0, "Invalid submission.").optional().or(z.literal("")),
});

export type EnquiryFormValues = z.infer<typeof enquirySchema>;
