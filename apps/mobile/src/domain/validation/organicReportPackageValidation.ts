import { z } from "zod";

import { ORGANIC_REPORT_PACKAGE_TYPES } from "../organic/OrganicReportPackage";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const organicReportPackageInputSchema = z.object({
  farmId: z.string().min(1),
  packageType: z.enum(ORGANIC_REPORT_PACKAGE_TYPES),
  title: z.string().trim().min(1, "Add a package title."),
  notes: optionalTrimmedText,
});
