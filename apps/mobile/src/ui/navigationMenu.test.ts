import assert from "node:assert/strict";
import test from "node:test";

import { menuItems } from "./navigationMenu";

test("navigation includes local farmhand management without worker-account links", () => {
  assert.ok(menuItems.some((item) => item.label === "Farmhands" && item.route === "/farmhands"));
  assert.equal(menuItems.some((item) => /login|account|payroll|timeclock|message/i.test(item.label)), false);
});

test("navigation keeps farm-event capture off the drawer menu", () => {
  const labels: readonly string[] = menuItems.map((item) => item.label);
  const routes: readonly string[] = menuItems.map((item) => item.route);

  assert.equal(labels.includes("Quick record farm events"), false);
  assert.equal(routes.includes("/farm-events/new"), false);
});
