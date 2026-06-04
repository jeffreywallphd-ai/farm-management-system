import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildCalendarWeeks, formatDateInput, parseDateInput, shiftMonth } from "./DateFieldModel";

describe("DateFieldModel", () => {
  it("formats local calendar dates as YYYY-MM-DD", () => {
    assert.equal(formatDateInput(new Date(2026, 5, 3)), "2026-06-03");
  });

  it("parses valid date input and rejects invalid calendar dates", () => {
    assert.equal(formatDateInput(parseDateInput("2026-06-03") as Date), "2026-06-03");
    assert.equal(parseDateInput("2026-02-31"), null);
    assert.equal(parseDateInput("June 3, 2026"), null);
  });

  it("builds a six-week calendar grid including adjacent month days", () => {
    const days = buildCalendarWeeks(2026, 5, new Date(2026, 5, 3));

    assert.equal(days.length, 42);
    assert.equal(days[0]?.date, "2026-05-31");
    assert.equal(days[1]?.date, "2026-06-01");
    assert.equal(days.find((day) => day.date === "2026-06-03")?.isToday, true);
    assert.equal(days[41]?.date, "2026-07-11");
  });

  it("can start the calendar grid on Monday when farm setup chooses Monday", () => {
    const days = buildCalendarWeeks(2026, 5, new Date(2026, 5, 3), 1);

    assert.equal(days[0]?.date, "2026-06-01");
    assert.equal(days[6]?.date, "2026-06-07");
    assert.equal(days[41]?.date, "2026-07-12");
  });

  it("shifts months across year boundaries", () => {
    assert.deepEqual(shiftMonth(2026, 0, -1), { year: 2025, month: 11 });
    assert.deepEqual(shiftMonth(2026, 11, 1), { year: 2027, month: 0 });
  });
});
