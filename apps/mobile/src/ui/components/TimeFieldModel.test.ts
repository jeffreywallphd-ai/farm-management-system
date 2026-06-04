import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatTimeDisplay, formatTimeInput, minuteOptionsFor, parseTimeInput } from "./TimeFieldModel";

describe("TimeFieldModel", () => {
  it("formats stored 24-hour time as AM/PM display text", () => {
    assert.equal(formatTimeDisplay("00:00"), "12:00 AM");
    assert.equal(formatTimeDisplay("08:05"), "8:05 AM");
    assert.equal(formatTimeDisplay("12:30"), "12:30 PM");
    assert.equal(formatTimeDisplay("17:45"), "5:45 PM");
  });

  it("converts AM/PM picker parts to the existing stored HH:MM format", () => {
    assert.equal(formatTimeInput({ hour: "12", minute: "00", meridiem: "AM" }), "00:00");
    assert.equal(formatTimeInput({ hour: "8", minute: "05", meridiem: "AM" }), "08:05");
    assert.equal(formatTimeInput({ hour: "12", minute: "30", meridiem: "PM" }), "12:30");
    assert.equal(formatTimeInput({ hour: "5", minute: "45", meridiem: "PM" }), "17:45");
  });

  it("parses 12-hour and 24-hour time inputs for existing data", () => {
    assert.deepEqual(parseTimeInput("7:15 PM"), { hour: "7", minute: "15", meridiem: "PM" });
    assert.deepEqual(parseTimeInput("19:15"), { hour: "7", minute: "15", meridiem: "PM" });
    assert.equal(parseTimeInput("not a time"), null);
  });

  it("keeps an existing non-five-minute value selectable", () => {
    assert.ok(minuteOptionsFor("08:17").includes("17"));
  });
});
