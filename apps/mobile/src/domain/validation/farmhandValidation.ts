import { z } from "zod";

import { FARMHAND_STATUSES, FARMHAND_WEEKDAYS } from "../farmhand/Farmhand";

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).optional().transform((value) => (value ? value : undefined));

const optionalDateText = optionalText(32);
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const farmhandInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  farmId: z.string().trim().min(1),
  name: z.string().trim().min(1, "Farmhand name is required.").max(120),
  phoneNumber: optionalText(40),
  notes: optionalText(1000),
  status: z.enum(FARMHAND_STATUSES).default("active"),
});

export const farmhandRecurringScheduleInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  farmId: z.string().trim().min(1),
  farmhandId: z.string().trim().min(1, "Choose a farmhand."),
  weekday: z.coerce.number().refine((value): value is (typeof FARMHAND_WEEKDAYS)[number] => FARMHAND_WEEKDAYS.includes(value as (typeof FARMHAND_WEEKDAYS)[number]), {
    message: "Choose a day of the week.",
  }),
  startTime: z.string().trim().regex(timePattern, "Use a start time like 08:00."),
  endTime: z.string().trim().regex(timePattern, "Use an end time like 17:00."),
  effectiveStartDate: optionalDateText,
  effectiveEndDate: optionalDateText,
  notes: optionalText(500),
}).superRefine((input, context) => {
  if (input.startTime >= input.endTime) {
    context.addIssue({ code: "custom", message: "End time must be after start time.", path: ["endTime"] });
  }
  if (input.effectiveStartDate && input.effectiveEndDate && input.effectiveStartDate > input.effectiveEndDate) {
    context.addIssue({ code: "custom", message: "End date must be after start date.", path: ["effectiveEndDate"] });
  }
});

export const farmhandWeeklyScheduleBlockInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  farmId: z.string().trim().min(1),
  farmhandId: z.string().trim().min(1, "Choose a farmhand."),
  date: z.string().trim().min(1, "Choose a date.").max(32),
  startTime: z.string().trim().regex(timePattern, "Use a start time like 08:00."),
  endTime: z.string().trim().regex(timePattern, "Use an end time like 17:00."),
  notes: optionalText(500),
}).refine((input) => input.startTime < input.endTime, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

export function normalizePhoneForTelLink(phoneNumber: string): string | undefined {
  const trimmed = phoneNumber.trim();
  if (!trimmed) {
    return undefined;
  }
  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length < 7) {
    return undefined;
  }
  return `${hasLeadingPlus ? "+" : ""}${digits}`;
}
