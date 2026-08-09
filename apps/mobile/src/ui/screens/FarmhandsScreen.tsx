import { useEffect, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { FarmhandRepository } from "../../application/ports/FarmhandRepository";
import {
  dateForWeekdayInWeek,
  orderedWeekdays,
  startOfWeekFor,
  type WeekStartsOn,
} from "../../application/use-cases/manage-farmhands/ListFarmhandWork";
import { replaceFarmhandRecurringSchedule, replaceFarmhandWeeklySchedule, saveFarmhand } from "../../application/use-cases/manage-farmhands/ManageFarmhands";
import type { Farm } from "../../domain/farm/Farm";
import {
  FARMHAND_STATUSES,
  FARMHAND_STATUS_LABELS,
  FARMHAND_WEEKDAY_LABELS,
  type Farmhand,
  type FarmhandRecurringSchedule,
  type FarmhandStatus,
  type FarmhandWeekday,
  type FarmhandWeeklyScheduleBlock,
} from "../../domain/farmhand/Farmhand";
import { normalizePhoneForTelLink } from "../../domain/validation/farmhandValidation";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DateField } from "../components/DateField";
import { EmptyState } from "../components/EmptyState";
import { FormField } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { TimeField } from "../components/TimeField";
import { useDatePreferences } from "../datePreferences";
import { theme } from "../theme/theme";
import {
  scheduleNotes,
  scheduleSummaryLines,
  selectCurrentFarmhandSchedule,
  type CurrentFarmhandSchedule,
} from "./FarmhandsScheduleModel";

type ScheduleEntryDraft = {
  id: string;
  weekday: FarmhandWeekday;
  startTime: string;
  endTime: string;
};

type ScheduleEntryMode = "sameTimes" | "differentTimes";
type ScheduleKind = "recurring" | "weekly";

export function FarmhandsScreen({
  farm,
  farmhandRepository,
}: {
  farm: Farm;
  farmhandRepository: FarmhandRepository;
}) {
  const [farmhands, setFarmhands] = useState<Farmhand[]>([]);
  const [recurringSchedules, setRecurringSchedules] = useState<FarmhandRecurringSchedule[]>([]);
  const [weeklyBlocks, setWeeklyBlocks] = useState<FarmhandWeeklyScheduleBlock[]>([]);
  const [selectedFarmhandId, setSelectedFarmhandId] = useState("");
  const { weekStartsOn } = useDatePreferences();
  const [error, setError] = useState<string | undefined>();
  const [schedulingFarmhandId, setSchedulingFarmhandId] = useState("");

  const [editingFarmhandId, setEditingFarmhandId] = useState("");
  const [farmhandName, setFarmhandName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [farmhandNotes, setFarmhandNotes] = useState("");
  const [farmhandStatus, setFarmhandStatus] = useState<FarmhandStatus>("active");

  const [editingScheduleFarmhandId, setEditingScheduleFarmhandId] = useState("");
  const [scheduleKind, setScheduleKind] = useState<ScheduleKind>("recurring");
  const [recurringMode, setRecurringMode] = useState<ScheduleEntryMode>("sameTimes");
  const [recurringFarmhandId, setRecurringFarmhandId] = useState("");
  const [recurringSelectedDays, setRecurringSelectedDays] = useState<FarmhandWeekday[]>([1]);
  const [recurringDraftEntries, setRecurringDraftEntries] = useState<ScheduleEntryDraft[]>([]);
  const [recurringStartTime, setRecurringStartTime] = useState("08:00");
  const [recurringEndTime, setRecurringEndTime] = useState("12:00");
  const [effectiveStartDate, setEffectiveStartDate] = useState("");
  const [effectiveEndDate, setEffectiveEndDate] = useState("");
  const [recurringNotes, setRecurringNotes] = useState("");

  const [weeklyMode, setWeeklyMode] = useState<ScheduleEntryMode>("sameTimes");
  const [weeklyFarmhandId, setWeeklyFarmhandId] = useState("");
  const [weeklyDate, setWeeklyDate] = useState(startOfWeekFor(todayDate(), 1));
  const [weeklySelectedDays, setWeeklySelectedDays] = useState<FarmhandWeekday[]>([1]);
  const [weeklyDraftEntries, setWeeklyDraftEntries] = useState<ScheduleEntryDraft[]>([]);
  const [weeklyStartTime, setWeeklyStartTime] = useState("08:00");
  const [weeklyEndTime, setWeeklyEndTime] = useState("12:00");
  const [weeklyNotes, setWeeklyNotes] = useState("");

  async function loadFarmhands(preferredFarmhandId = selectedFarmhandId) {
    const [nextFarmhands, nextRecurringSchedules, nextWeeklyBlocks] = await Promise.all([
      farmhandRepository.listFarmhands(farm.id),
      farmhandRepository.listRecurringSchedules(farm.id),
      farmhandRepository.listWeeklyScheduleBlocks(farm.id),
    ]);
    setFarmhands(nextFarmhands);
    setRecurringSchedules(nextRecurringSchedules);
    setWeeklyBlocks(nextWeeklyBlocks);

    const nextSelectedFarmhandId = preferredFarmhandId || nextFarmhands.find((farmhand) => farmhand.status === "active")?.id || nextFarmhands[0]?.id || "";
    setSelectedFarmhandId(nextSelectedFarmhandId);
    if (!recurringFarmhandId && nextSelectedFarmhandId) setRecurringFarmhandId(nextSelectedFarmhandId);
    if (!weeklyFarmhandId && nextSelectedFarmhandId) setWeeklyFarmhandId(nextSelectedFarmhandId);
  }

  useEffect(() => {
    loadFarmhands().catch(() => setError("Farmhand records could not be loaded from this device."));
  }, [farm.id, farmhandRepository]);

  useEffect(() => {
    setWeeklyDate((current) => startOfWeekFor(current || todayDate(), weekStartsOn));
    setRecurringSelectedDays((current) => current.length ? orderSelectedDays(current, weekStartsOn) : [weekStartsOn]);
    setWeeklySelectedDays((current) => current.length ? orderSelectedDays(current, weekStartsOn) : [weekStartsOn]);
  }, [weekStartsOn]);

  function errorMessage(caught: unknown, fallback: string): string {
    if (caught instanceof z.ZodError) {
      return caught.issues[0]?.message ?? fallback;
    }
    return caught instanceof Error ? caught.message : fallback;
  }

  function resetFarmhandForm() {
    setEditingFarmhandId("");
    setFarmhandName("");
    setPhoneNumber("");
    setFarmhandNotes("");
    setFarmhandStatus("active");
  }

  function beginEditFarmhand(farmhand: Farmhand) {
    setEditingFarmhandId(farmhand.id);
    setFarmhandName(farmhand.name);
    setPhoneNumber(farmhand.phoneNumber ?? "");
    setFarmhandNotes(farmhand.notes ?? "");
    setFarmhandStatus(farmhand.status);
  }

  async function handleSaveFarmhand() {
    setError(undefined);
    try {
      const saved = await saveFarmhand(
        {
          farmId: farm.id,
          id: editingFarmhandId || undefined,
          name: farmhandName,
          notes: farmhandNotes,
          phoneNumber,
          status: farmhandStatus,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository: farmhandRepository },
      );
      resetFarmhandForm();
      await loadFarmhands(saved.id);
    } catch (caught) {
      setError(errorMessage(caught, "Farmhand could not be saved."));
    }
  }

  async function handleCallFarmhand(farmhand: Farmhand) {
    const normalizedPhone = normalizePhoneForTelLink(farmhand.phoneNumber ?? "");
    if (!normalizedPhone) {
      setError("Add a valid phone number before calling.");
      return;
    }
    try {
      await Linking.openURL(`tel:${normalizedPhone}`);
    } catch {
      setError("This device could not open the phone app.");
    }
  }

  function toggleSchedulePanel(farmhand: Farmhand) {
    if (schedulingFarmhandId === farmhand.id) {
      setSchedulingFarmhandId("");
      setEditingScheduleFarmhandId("");
      resetRecurringForm(farmhand.id);
      resetWeeklyForm(farmhand.id);
      return;
    }

    setSchedulingFarmhandId(farmhand.id);
    setSelectedFarmhandId(farmhand.id);
    setEditingScheduleFarmhandId("");
    setScheduleKind("recurring");
    resetRecurringForm(farmhand.id);
    resetWeeklyForm(farmhand.id);
  }

  function resetRecurringForm(nextFarmhandId = selectedFarmhandId) {
    setRecurringMode("sameTimes");
    setRecurringFarmhandId(nextFarmhandId);
    setRecurringSelectedDays([weekStartsOn]);
    setRecurringDraftEntries([]);
    setRecurringStartTime("08:00");
    setRecurringEndTime("12:00");
    setEffectiveStartDate("");
    setEffectiveEndDate("");
    setRecurringNotes("");
  }

  function beginEditSchedule(farmhand: Farmhand, schedule: CurrentFarmhandSchedule) {
    setSchedulingFarmhandId(farmhand.id);
    setEditingScheduleFarmhandId(farmhand.id);
    if (schedule.kind === "recurring") {
      setScheduleKind("recurring");
      loadRecurringScheduleForm(farmhand.id, schedule.entries);
    } else {
      setScheduleKind("weekly");
      loadWeeklyScheduleForm(farmhand.id, schedule);
    }
  }

  async function handleSaveRecurringSchedule() {
    setError(undefined);
    try {
      const entries = recurringMode === "sameTimes"
        ? recurringSelectedDays.map((day) => ({ weekday: day, startTime: recurringStartTime, endTime: recurringEndTime }))
        : recurringDraftEntries;
      if (!entries.length) {
        setError("Choose at least one recurring day.");
        return;
      }

      await replaceFarmhandRecurringSchedule(
        {
          farmId: farm.id,
          farmhandId: recurringFarmhandId,
          entries,
          effectiveStartDate,
          effectiveEndDate,
          notes: recurringNotes,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository: farmhandRepository },
      );
      setEditingScheduleFarmhandId("");
      resetRecurringForm(recurringFarmhandId);
      await loadFarmhands(schedulingFarmhandId || selectedFarmhandId || recurringFarmhandId);
    } catch (caught) {
      setError(errorMessage(caught, "Recurring schedule could not be saved."));
    }
  }

  function resetWeeklyForm(nextFarmhandId = selectedFarmhandId) {
    setWeeklyMode("sameTimes");
    setWeeklyFarmhandId(nextFarmhandId);
    setWeeklyDate(startOfWeekFor(todayDate(), weekStartsOn));
    setWeeklySelectedDays([weekStartsOn]);
    setWeeklyDraftEntries([]);
    setWeeklyStartTime("08:00");
    setWeeklyEndTime("12:00");
    setWeeklyNotes("");
  }

  function loadRecurringScheduleForm(farmhandId: string, entries: FarmhandRecurringSchedule[]) {
    const orderedEntries = entries.slice().sort((left, right) => weekdayOrder(left.weekday, weekStartsOn) - weekdayOrder(right.weekday, weekStartsOn) || left.startTime.localeCompare(right.startTime));
    const firstEntry = orderedEntries[0];
    const hasSameTimes = orderedEntries.length > 0 && orderedEntries.every((entry) => entry.startTime === firstEntry?.startTime && entry.endTime === firstEntry?.endTime);

    setRecurringFarmhandId(farmhandId);
    setRecurringMode(hasSameTimes ? "sameTimes" : "differentTimes");
    setRecurringSelectedDays(orderedEntries.map((entry) => entry.weekday));
    setRecurringDraftEntries(orderedEntries.map(scheduleEntryDraftFromRecurring));
    setRecurringStartTime(firstEntry?.startTime ?? "08:00");
    setRecurringEndTime(firstEntry?.endTime ?? "12:00");
    setEffectiveStartDate(sharedOptionalValue(orderedEntries.map((entry) => entry.effectiveStartDate)));
    setEffectiveEndDate(sharedOptionalValue(orderedEntries.map((entry) => entry.effectiveEndDate)));
    setRecurringNotes(sharedOptionalValue(orderedEntries.map((entry) => entry.notes)));
  }

  function loadWeeklyScheduleForm(farmhandId: string, schedule: Extract<CurrentFarmhandSchedule, { kind: "weekly" }>) {
    const orderedEntries = schedule.entries.slice().sort((left, right) => weekdayOrderForDate(left.date, weekStartsOn) - weekdayOrderForDate(right.date, weekStartsOn) || left.startTime.localeCompare(right.startTime));
    const firstEntry = orderedEntries[0];
    const hasSameTimes = orderedEntries.length > 0 && orderedEntries.every((entry) => entry.startTime === firstEntry?.startTime && entry.endTime === firstEntry?.endTime);

    setWeeklyFarmhandId(farmhandId);
    setWeeklyMode(hasSameTimes ? "sameTimes" : "differentTimes");
    setWeeklyDate(schedule.weekStartDate);
    setWeeklySelectedDays(orderedEntries.map((entry) => weekdayForDate(entry.date)));
    setWeeklyDraftEntries(orderedEntries.map(scheduleEntryDraftFromWeekly));
    setWeeklyStartTime(firstEntry?.startTime ?? "08:00");
    setWeeklyEndTime(firstEntry?.endTime ?? "12:00");
    setWeeklyNotes(sharedOptionalValue(orderedEntries.map((entry) => entry.notes)));
  }

  async function handleSaveWeeklyBlock() {
    setError(undefined);
    try {
      if (!weeklyDate) {
        setError("Choose the week start date.");
        return;
      }
      const weekStartDate = startOfWeekFor(weeklyDate, weekStartsOn);
      const entries = weeklyMode === "sameTimes"
        ? weeklySelectedDays.map((day) => ({ weekday: day, startTime: weeklyStartTime, endTime: weeklyEndTime }))
        : weeklyDraftEntries;
      if (!entries.length) {
        setError("Choose at least one day for the week.");
        return;
      }

      await replaceFarmhandWeeklySchedule(
        {
          farmId: farm.id,
          farmhandId: weeklyFarmhandId,
          blocks: entries.map((entry) => ({
            date: dateForWeekdayInWeek(weekStartDate, entry.weekday, weekStartsOn),
            startTime: entry.startTime,
            endTime: entry.endTime,
          })),
          notes: weeklyNotes,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository: farmhandRepository },
      );
      setEditingScheduleFarmhandId("");
      resetWeeklyForm(weeklyFarmhandId);
      await loadFarmhands(schedulingFarmhandId || selectedFarmhandId || weeklyFarmhandId);
    } catch (caught) {
      setError(errorMessage(caught, "Week-by-week schedule could not be saved."));
    }
  }

  function toggleRecurringSelectedDay(day: FarmhandWeekday) {
    setRecurringSelectedDays((current) => toggleDay(current, day, weekStartsOn));
  }

  function toggleWeeklySelectedDay(day: FarmhandWeekday) {
    setWeeklySelectedDays((current) => toggleDay(current, day, weekStartsOn));
  }

  function addRecurringDraftEntry() {
    setRecurringDraftEntries((current) => [
      ...current,
      createDraftEntry(current, weekStartsOn),
    ]);
  }

  function addWeeklyDraftEntry() {
    setWeeklyDraftEntries((current) => [
      ...current,
      createDraftEntry(current, weekStartsOn),
    ]);
  }

  function updateRecurringDraftEntry(id: string, changes: Partial<Omit<ScheduleEntryDraft, "id">>) {
    setRecurringDraftEntries((current) => current.map((entry) => entry.id === id ? { ...entry, ...changes } : entry));
  }

  function updateWeeklyDraftEntry(id: string, changes: Partial<Omit<ScheduleEntryDraft, "id">>) {
    setWeeklyDraftEntries((current) => current.map((entry) => entry.id === id ? { ...entry, ...changes } : entry));
  }

  function removeRecurringDraftEntry(id: string) {
    setRecurringDraftEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function removeWeeklyDraftEntry(id: string) {
    setWeeklyDraftEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function handleWeeklyDateChange(value: string) {
    setWeeklyDate(value ? startOfWeekFor(value, weekStartsOn) : "");
  }

  const dayOptions = orderedWeekdays(weekStartsOn).map((day) => ({ label: FARMHAND_WEEKDAY_LABELS[day as FarmhandWeekday], value: String(day) }));

  return (
    <Screen>
      <PageHeader
        eyebrow="Farm planning"
        supportingText="Keep farmhand contact, schedules, and assigned work together on this device."
        title="Farmhands"
      />

      <Card rootLevelHeader>
        <SectionHeading detail="Phone numbers and notes stay local unless you export a recovery copy." title="Add farmhand" />
        {!editingFarmhandId ? (
          <FarmhandForm
            farmhandName={farmhandName}
            farmhandNotes={farmhandNotes}
            farmhandStatus={farmhandStatus}
            phoneNumber={phoneNumber}
            saveLabel="Save farmhand"
            onCancel={undefined}
            onFarmhandNameChange={setFarmhandName}
            onFarmhandNotesChange={setFarmhandNotes}
            onFarmhandStatusChange={(value) => setFarmhandStatus(value as FarmhandStatus)}
            onPhoneNumberChange={setPhoneNumber}
            onSave={handleSaveFarmhand}
          />
        ) : (
          <Text style={styles.itemDetail}>Finish or cancel the open farmhand edit in the directory below.</Text>
        )}
      </Card>

      <Card rootLevelHeader>
        <SectionHeading detail="Tap a farmhand to edit details or call from this phone." title="Farmhand directory" />
        {farmhands.length ? farmhands.map((farmhand) => {
          const farmhandRecurringSchedules = recurringSchedules.filter((schedule) => schedule.farmhandId === farmhand.id);
          const farmhandWeeklyBlocks = weeklyBlocks.filter((block) => block.farmhandId === farmhand.id);
          const farmhandScheduleOptions = farmhandOptionsFor(farmhand);
          const currentSchedule = selectCurrentFarmhandSchedule(farmhandRecurringSchedules, farmhandWeeklyBlocks, weekStartsOn);
          const isScheduling = schedulingFarmhandId === farmhand.id;
          const isEditingSchedule = editingScheduleFarmhandId === farmhand.id;
          const shouldShowScheduleForm = !currentSchedule || isEditingSchedule;

          return (
            <View key={farmhand.id} style={styles.listItem}>
              <Text style={styles.itemTitle}>{farmhand.name}</Text>
              <Text style={styles.itemDetail}>{FARMHAND_STATUS_LABELS[farmhand.status]}{farmhand.phoneNumber ? ` - ${farmhand.phoneNumber}` : ""}</Text>
              {farmhand.notes ? <Text style={styles.itemDetail}>{farmhand.notes}</Text> : null}
              <View style={styles.actions}>
                <Button label={isScheduling ? "Hide schedule" : "Schedule"} onPress={() => toggleSchedulePanel(farmhand)} size="large" variant="secondary" />
                <Button label="Edit farmhand" onPress={() => beginEditFarmhand(farmhand)} size="large" variant="secondary" />
                <Button disabled={!normalizePhoneForTelLink(farmhand.phoneNumber ?? "")} label="Call" onPress={() => handleCallFarmhand(farmhand)} size="large" />
              </View>
              {editingFarmhandId === farmhand.id ? (
                <FarmhandForm
                  farmhandName={farmhandName}
                  farmhandNotes={farmhandNotes}
                  farmhandStatus={farmhandStatus}
                  phoneNumber={phoneNumber}
                  saveLabel="Save farmhand changes"
                  onCancel={resetFarmhandForm}
                  onFarmhandNameChange={setFarmhandName}
                  onFarmhandNotesChange={setFarmhandNotes}
                  onFarmhandStatusChange={(value) => setFarmhandStatus(value as FarmhandStatus)}
                  onPhoneNumberChange={setPhoneNumber}
                  onSave={handleSaveFarmhand}
                />
              ) : null}
              {isScheduling ? (
                <View style={styles.schedulePanel}>
                  <SectionHeading
                    detail="Keep one current schedule for this farmhand. Saving replaces older schedule rows for this farmhand."
                    rootCardHeader={false}
                    title="Schedule"
                  />
                  {currentSchedule && !isEditingSchedule ? (
                    <CurrentScheduleCard
                      schedule={currentSchedule}
                      weekStartsOn={weekStartsOn}
                      onEdit={() => beginEditSchedule(farmhand, currentSchedule)}
                    />
                  ) : null}
                  {shouldShowScheduleForm ? (
                    <View style={styles.scheduleSection}>
                      <SelectField
                        label="Schedule type"
                        onChange={(value) => {
                          const nextKind = value as ScheduleKind;
                          setScheduleKind(nextKind);
                          if (nextKind === "recurring") resetRecurringForm(farmhand.id);
                          else resetWeeklyForm(farmhand.id);
                        }}
                        options={[
                          { label: "Recurring weekly", value: "recurring" },
                          { label: "Week-by-week", value: "weekly" },
                        ]}
                        value={scheduleKind}
                      />
                      {scheduleKind === "recurring" ? (
                        <RecurringScheduleCreateForm
                          dayOptions={dayOptions}
                          effectiveEndDate={effectiveEndDate}
                          effectiveStartDate={effectiveStartDate}
                          farmhandOptions={farmhandScheduleOptions}
                          mode={recurringMode}
                          recurringDraftEntries={recurringDraftEntries}
                          recurringEndTime={recurringEndTime}
                          recurringFarmhandId={recurringFarmhandId}
                          recurringNotes={recurringNotes}
                          recurringSelectedDays={recurringSelectedDays}
                          recurringStartTime={recurringStartTime}
                          saveLabel={currentSchedule ? "Save schedule changes" : "Save recurring schedule"}
                          showFarmhandField={false}
                          onAddDraftEntry={addRecurringDraftEntry}
                          onEffectiveEndDateChange={setEffectiveEndDate}
                          onEffectiveStartDateChange={setEffectiveStartDate}
                          onModeChange={(value) => setRecurringMode(value as ScheduleEntryMode)}
                          onRemoveDraftEntry={removeRecurringDraftEntry}
                          onRecurringEndTimeChange={setRecurringEndTime}
                          onRecurringFarmhandChange={setRecurringFarmhandId}
                          onRecurringNotesChange={setRecurringNotes}
                          onRecurringStartTimeChange={setRecurringStartTime}
                          onSave={handleSaveRecurringSchedule}
                          onToggleDay={toggleRecurringSelectedDay}
                          onUpdateDraftEntry={updateRecurringDraftEntry}
                        />
                      ) : (
                        <WeeklyScheduleCreateForm
                          dayOptions={dayOptions}
                          farmhandOptions={farmhandScheduleOptions}
                          mode={weeklyMode}
                          saveLabel={currentSchedule ? "Save schedule changes" : "Save week-by-week schedule"}
                          showFarmhandField={false}
                          weekStartsOn={weekStartsOn}
                          weeklyDraftEntries={weeklyDraftEntries}
                          weeklyDate={weeklyDate}
                          weeklyEndTime={weeklyEndTime}
                          weeklyFarmhandId={weeklyFarmhandId}
                          weeklyNotes={weeklyNotes}
                          weeklySelectedDays={weeklySelectedDays}
                          weeklyStartTime={weeklyStartTime}
                          onAddDraftEntry={addWeeklyDraftEntry}
                          onModeChange={(value) => setWeeklyMode(value as ScheduleEntryMode)}
                          onRemoveDraftEntry={removeWeeklyDraftEntry}
                          onSave={handleSaveWeeklyBlock}
                          onToggleDay={toggleWeeklySelectedDay}
                          onUpdateDraftEntry={updateWeeklyDraftEntry}
                          onWeeklyDateChange={handleWeeklyDateChange}
                          onWeeklyEndTimeChange={setWeeklyEndTime}
                          onWeeklyFarmhandChange={setWeeklyFarmhandId}
                          onWeeklyNotesChange={setWeeklyNotes}
                          onWeeklyStartTimeChange={setWeeklyStartTime}
                        />
                      )}
                      {currentSchedule ? (
                        <Button
                          label="Cancel edit"
                          onPress={() => {
                            setEditingScheduleFarmhandId("");
                            resetRecurringForm(farmhand.id);
                            resetWeeklyForm(farmhand.id);
                          }}
                          size="large"
                          variant="secondary"
                        />
                      ) : null}
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        }) : <EmptyState text="Add the people who help with farm work." />}
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

function CurrentScheduleCard({
  schedule,
  weekStartsOn,
  onEdit,
}: {
  schedule: CurrentFarmhandSchedule;
  weekStartsOn: WeekStartsOn;
  onEdit: () => void;
}) {
  const notes = scheduleNotes(schedule);
  return (
    <View style={styles.currentScheduleCard}>
      <Text style={styles.itemTitle}>{schedule.kind === "recurring" ? "Recurring weekly schedule" : "Week-by-week schedule"}</Text>
      {schedule.kind === "weekly" ? <Text style={styles.itemDetail}>Week of {schedule.weekStartDate}</Text> : null}
      {scheduleSummaryLines(schedule, weekStartsOn).map((line) => (
        <Text key={line} style={styles.scheduleLine}>{line}</Text>
      ))}
      {notes ? <Text style={styles.itemDetail}>{notes}</Text> : null}
      <Button label="Edit schedule" onPress={onEdit} size="large" variant="secondary" />
    </View>
  );
}

function FarmhandForm({
  farmhandName,
  farmhandNotes,
  farmhandStatus,
  phoneNumber,
  saveLabel,
  onCancel,
  onFarmhandNameChange,
  onFarmhandNotesChange,
  onFarmhandStatusChange,
  onPhoneNumberChange,
  onSave,
}: {
  farmhandName: string;
  farmhandNotes: string;
  farmhandStatus: FarmhandStatus;
  phoneNumber: string;
  saveLabel: string;
  onCancel?: () => void;
  onFarmhandNameChange: (value: string) => void;
  onFarmhandNotesChange: (value: string) => void;
  onFarmhandStatusChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.inlineEdit}>
      <FormField label="Name" onChangeText={onFarmhandNameChange} placeholder="Sam Rivera" value={farmhandName} />
      <FormField label="Phone number" onChangeText={onPhoneNumberChange} placeholder="Optional" value={phoneNumber} />
      <FormField label="Notes" multiline onChangeText={onFarmhandNotesChange} placeholder="Optional skills, availability notes, or reminders" value={farmhandNotes} />
      <SelectField
        label="Status"
        onChange={onFarmhandStatusChange}
        options={FARMHAND_STATUSES.map((status) => ({ label: FARMHAND_STATUS_LABELS[status], value: status }))}
        value={farmhandStatus}
      />
      <Button label={saveLabel} onPress={onSave} size="large" />
      {onCancel ? <Button label="Cancel edit" onPress={onCancel} size="large" variant="secondary" /> : null}
    </View>
  );
}

function RecurringScheduleCreateForm({
  dayOptions,
  effectiveEndDate,
  effectiveStartDate,
  farmhandOptions,
  mode,
  recurringDraftEntries,
  recurringEndTime,
  recurringFarmhandId,
  recurringNotes,
  recurringSelectedDays,
  recurringStartTime,
  saveLabel,
  showFarmhandField = true,
  onAddDraftEntry,
  onEffectiveEndDateChange,
  onEffectiveStartDateChange,
  onModeChange,
  onRemoveDraftEntry,
  onRecurringEndTimeChange,
  onRecurringFarmhandChange,
  onRecurringNotesChange,
  onRecurringStartTimeChange,
  onSave,
  onToggleDay,
  onUpdateDraftEntry,
}: {
  dayOptions: Array<{ label: string; value: string }>;
  effectiveEndDate: string;
  effectiveStartDate: string;
  farmhandOptions: Array<{ label: string; value: string }>;
  mode: ScheduleEntryMode;
  recurringDraftEntries: ScheduleEntryDraft[];
  recurringEndTime: string;
  recurringFarmhandId: string;
  recurringNotes: string;
  recurringSelectedDays: FarmhandWeekday[];
  recurringStartTime: string;
  saveLabel: string;
  showFarmhandField?: boolean;
  onAddDraftEntry: () => void;
  onEffectiveEndDateChange: (value: string) => void;
  onEffectiveStartDateChange: (value: string) => void;
  onModeChange: (value: string) => void;
  onRemoveDraftEntry: (id: string) => void;
  onRecurringEndTimeChange: (value: string) => void;
  onRecurringFarmhandChange: (value: string) => void;
  onRecurringNotesChange: (value: string) => void;
  onRecurringStartTimeChange: (value: string) => void;
  onSave: () => void;
  onToggleDay: (day: FarmhandWeekday) => void;
  onUpdateDraftEntry: (id: string, changes: Partial<Omit<ScheduleEntryDraft, "id">>) => void;
}) {
  return (
    <View style={styles.inlineEdit}>
      {showFarmhandField ? <SelectField label="Farmhand" onChange={onRecurringFarmhandChange} options={farmhandOptions} value={recurringFarmhandId} /> : null}
      <SelectField
        label="Pattern"
        onChange={onModeChange}
        options={[
          { label: "Same times each day", value: "sameTimes" },
          { label: "Different times by day", value: "differentTimes" },
        ]}
        value={mode}
      />
      {mode === "sameTimes" ? (
        <>
          <DayMultiSelect dayOptions={dayOptions} selectedDays={recurringSelectedDays} onToggleDay={onToggleDay} />
          <View style={styles.timeRow}>
            <TimeField label="Start time" onChangeText={onRecurringStartTimeChange} value={recurringStartTime} />
            <TimeField label="End time" onChangeText={onRecurringEndTimeChange} value={recurringEndTime} />
          </View>
        </>
      ) : (
        <ScheduleEntryDraftList
          dayOptions={dayOptions}
          entries={recurringDraftEntries}
          onAddEntry={onAddDraftEntry}
          onRemoveEntry={onRemoveDraftEntry}
          onUpdateEntry={onUpdateDraftEntry}
        />
      )}
      <DateField label="Starts on" onChangeText={onEffectiveStartDateChange} placeholder="Optional" value={effectiveStartDate} />
      <DateField label="Ends on" onChangeText={onEffectiveEndDateChange} placeholder="Optional" value={effectiveEndDate} />
      <FormField label="Notes" onChangeText={onRecurringNotesChange} placeholder="Optional" value={recurringNotes} />
      <Button label={saveLabel} onPress={onSave} size="large" />
    </View>
  );
}

function WeeklyScheduleCreateForm({
  dayOptions,
  farmhandOptions,
  mode,
  saveLabel,
  showFarmhandField = true,
  weekStartsOn,
  weeklyDate,
  weeklyDraftEntries,
  weeklyEndTime,
  weeklyFarmhandId,
  weeklyNotes,
  weeklySelectedDays,
  weeklyStartTime,
  onAddDraftEntry,
  onModeChange,
  onRemoveDraftEntry,
  onSave,
  onToggleDay,
  onUpdateDraftEntry,
  onWeeklyDateChange,
  onWeeklyEndTimeChange,
  onWeeklyFarmhandChange,
  onWeeklyNotesChange,
  onWeeklyStartTimeChange,
}: {
  dayOptions: Array<{ label: string; value: string }>;
  farmhandOptions: Array<{ label: string; value: string }>;
  mode: ScheduleEntryMode;
  saveLabel: string;
  showFarmhandField?: boolean;
  weekStartsOn: WeekStartsOn;
  weeklyDate: string;
  weeklyDraftEntries: ScheduleEntryDraft[];
  weeklyEndTime: string;
  weeklyFarmhandId: string;
  weeklyNotes: string;
  weeklySelectedDays: FarmhandWeekday[];
  weeklyStartTime: string;
  onAddDraftEntry: () => void;
  onModeChange: (value: string) => void;
  onRemoveDraftEntry: (id: string) => void;
  onSave: () => void;
  onToggleDay: (day: FarmhandWeekday) => void;
  onUpdateDraftEntry: (id: string, changes: Partial<Omit<ScheduleEntryDraft, "id">>) => void;
  onWeeklyDateChange: (value: string) => void;
  onWeeklyEndTimeChange: (value: string) => void;
  onWeeklyFarmhandChange: (value: string) => void;
  onWeeklyNotesChange: (value: string) => void;
  onWeeklyStartTimeChange: (value: string) => void;
}) {
  return (
    <View style={styles.inlineEdit}>
      {showFarmhandField ? <SelectField label="Farmhand" onChange={onWeeklyFarmhandChange} options={farmhandOptions} value={weeklyFarmhandId} /> : null}
      <DateField label={`Week Of (${FARMHAND_WEEKDAY_LABELS[weekStartsOn]})`} onChangeText={onWeeklyDateChange} value={weeklyDate} />
      <SelectField
        label="Pattern"
        onChange={onModeChange}
        options={[
          { label: "Same times each day", value: "sameTimes" },
          { label: "Different times by day", value: "differentTimes" },
        ]}
        value={mode}
      />
      {mode === "sameTimes" ? (
        <>
          <DayMultiSelect dayOptions={dayOptions} selectedDays={weeklySelectedDays} onToggleDay={onToggleDay} />
          <View style={styles.timeRow}>
            <TimeField label="Start time" onChangeText={onWeeklyStartTimeChange} value={weeklyStartTime} />
            <TimeField label="End time" onChangeText={onWeeklyEndTimeChange} value={weeklyEndTime} />
          </View>
        </>
      ) : (
        <ScheduleEntryDraftList
          dayOptions={dayOptions}
          entries={weeklyDraftEntries}
          onAddEntry={onAddDraftEntry}
          onRemoveEntry={onRemoveDraftEntry}
          onUpdateEntry={onUpdateDraftEntry}
        />
      )}
      <FormField label="Notes" onChangeText={onWeeklyNotesChange} placeholder="Optional" value={weeklyNotes} />
      <Button label={saveLabel} onPress={onSave} size="large" />
    </View>
  );
}

function DayMultiSelect({
  dayOptions,
  selectedDays,
  onToggleDay,
}: {
  dayOptions: Array<{ label: string; value: string }>;
  selectedDays: FarmhandWeekday[];
  onToggleDay: (day: FarmhandWeekday) => void;
}) {
  return (
    <View style={styles.inlineEdit}>
      <Text style={styles.itemDetail}>Days worked</Text>
      <View style={styles.actions}>
        {dayOptions.map((option) => {
          const day = Number(option.value) as FarmhandWeekday;
          const isSelected = selectedDays.includes(day);
          return (
            <Button
              key={option.value}
              label={option.label}
              onPress={() => onToggleDay(day)}
              size="large"
              variant={isSelected ? "primary" : "secondary"}
            />
          );
        })}
      </View>
    </View>
  );
}

function ScheduleEntryDraftList({
  dayOptions,
  entries,
  onAddEntry,
  onRemoveEntry,
  onUpdateEntry,
}: {
  dayOptions: Array<{ label: string; value: string }>;
  entries: ScheduleEntryDraft[];
  onAddEntry: () => void;
  onRemoveEntry: (id: string) => void;
  onUpdateEntry: (id: string, changes: Partial<Omit<ScheduleEntryDraft, "id">>) => void;
}) {
  return (
    <View style={styles.inlineEdit}>
      <Button label="Add day and time" onPress={onAddEntry} size="large" variant="secondary" />
      {entries.length ? entries.map((entry) => (
        <View key={entry.id} style={styles.compactItem}>
          <SelectField
            label="Day"
            onChange={(value) => onUpdateEntry(entry.id, { weekday: Number(value) as FarmhandWeekday })}
            options={dayOptions}
            value={String(entry.weekday)}
          />
          <View style={styles.timeRow}>
            <TimeField label="Start time" onChangeText={(value) => onUpdateEntry(entry.id, { startTime: value })} value={entry.startTime} />
            <TimeField label="End time" onChangeText={(value) => onUpdateEntry(entry.id, { endTime: value })} value={entry.endTime} />
          </View>
          <Button label="Remove this entry" onPress={() => onRemoveEntry(entry.id)} size="large" variant="secondary" />
        </View>
      )) : <EmptyState text="Add at least one day and time." />}
    </View>
  );
}

function toggleDay(current: FarmhandWeekday[], day: FarmhandWeekday, weekStartsOn: WeekStartsOn): FarmhandWeekday[] {
  const next = current.includes(day) ? current.filter((candidate) => candidate !== day) : [...current, day];
  return orderSelectedDays(next, weekStartsOn);
}

function orderSelectedDays(current: FarmhandWeekday[], weekStartsOn: WeekStartsOn): FarmhandWeekday[] {
  return orderedWeekdays(weekStartsOn).filter((candidate): candidate is FarmhandWeekday => current.includes(candidate as FarmhandWeekday));
}

function createDraftEntry(current: ScheduleEntryDraft[], weekStartsOn: WeekStartsOn): ScheduleEntryDraft {
  const days = orderedWeekdays(weekStartsOn);
  const weekday = days[current.length % days.length] as FarmhandWeekday;
  return {
    id: `draft-${Date.now()}-${current.length}`,
    weekday,
    startTime: "08:00",
    endTime: "12:00",
  };
}

function scheduleEntryDraftFromRecurring(entry: FarmhandRecurringSchedule): ScheduleEntryDraft {
  return {
    id: `draft-${entry.id}`,
    weekday: entry.weekday,
    startTime: entry.startTime,
    endTime: entry.endTime,
  };
}

function scheduleEntryDraftFromWeekly(entry: FarmhandWeeklyScheduleBlock): ScheduleEntryDraft {
  return {
    id: `draft-${entry.id}`,
    weekday: weekdayForDate(entry.date),
    startTime: entry.startTime,
    endTime: entry.endTime,
  };
}

function sharedOptionalValue(values: Array<string | undefined>): string {
  const normalized = values.map((value) => value ?? "");
  return normalized.length && normalized.every((value) => value === normalized[0]) ? normalized[0] ?? "" : "";
}

function weekdayOrder(weekday: FarmhandWeekday, weekStartsOn: WeekStartsOn): number {
  return orderedWeekdays(weekStartsOn).indexOf(weekday);
}

function weekdayOrderForDate(date: string, weekStartsOn: WeekStartsOn): number {
  return weekdayOrder(weekdayForDate(date), weekStartsOn);
}

function weekdayForDate(date: string): FarmhandWeekday {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay() as FarmhandWeekday;
}

function farmhandOptionsFor(farmhand: Farmhand): Array<{ label: string; value: string }> {
  return [{ label: farmhand.name, value: farmhand.id }];
}

function todayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  actions: {
    gap: theme.spacing.sm,
  },
  compactItem: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  currentScheduleCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  inlineEdit: {
    gap: theme.spacing.sm,
  },
  itemDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  itemTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.section,
    fontWeight: theme.typography.headingFontWeight,
    lineHeight: 26,
  },
  listItem: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  schedulePanel: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  scheduleSection: {
    gap: theme.spacing.sm,
  },
  scheduleLine: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
    lineHeight: 24,
  },
  timeRow: {
    gap: theme.spacing.sm,
  },
});
