import { z } from "zod";

export function mapZodIssues(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] = issue.message;
  }

  return errors;
}
