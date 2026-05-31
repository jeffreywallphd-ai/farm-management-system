import assert from "node:assert/strict";
import test from "node:test";

import { theme } from "./theme/theme";

test("shared button touch targets are sized for field use", () => {
  assert.equal(theme.spacing.touchTarget >= 56, true);
  assert.equal(theme.spacing.primaryTouchTarget >= 72, true);
  assert.equal(theme.spacing.primaryTouchTarget > theme.spacing.touchTarget, true);
});
