import type { FarmId } from "../farm/Farm";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export const ORGANIC_REPORT_PACKAGE_TYPES = ["inspectionPrep", "annualUpdate", "recordsArchive"] as const;
export type OrganicReportPackageType = (typeof ORGANIC_REPORT_PACKAGE_TYPES)[number];

export const ORGANIC_REPORT_PACKAGE_TYPE_LABELS: Record<OrganicReportPackageType, string> = {
  inspectionPrep: "Inspection prep",
  annualUpdate: "Annual update",
  recordsArchive: "Records archive",
};

export interface OrganicReportPackage {
  id: string;
  farmId: FarmId;
  packageType: OrganicReportPackageType;
  title: string;
  generatedAt: IsoDateTimeString;
  reportNames: string[];
  manifestJson: string;
  packageText: string;
  notes?: string;
  createdAt: IsoDateTimeString;
}
