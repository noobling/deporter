import dayjs from "dayjs";
import plan from "../db/plan";

export const updateDateTimeForRecurringPlans = async () => {
  console.log("Updating date time for recurring plans");
  const plans = await plan.listAll();
  const recurringPlans = plans.filter(
    (p) =>
      p.recurring &&
      p.recurring !== "none" &&
      dayjs().isAfter(dayjs(p.start_date_time).add(2, "hours")) // Allow a 2 hour buffer before moving the date. We can update this as needed
  );

  for (const planToUpdate of recurringPlans) {
    console.log("Found past plan with recurrence to update", planToUpdate);
    await plan.moveStartDateTimeToNextOccurrence(planToUpdate._id);
  }
};
