import dayjs from "dayjs";
import plan from "../db/plan";
import { getPlaceTimeInUtc } from "../utils/plan";

export const updateDateTimeForRecurringPlans = async () => {
  console.log("Updating date time for recurring plans");
  const plans = await plan.listAll();
  const recurringPlans = plans.filter(
    (p) =>
      p.recurring &&
      p.recurring !== "none" &&
      dayjs().isAfter(p.start_date_time)
  );

  for (const planToUpdate of recurringPlans) {
    console.log("Found past plan with recurrence to update", planToUpdate);
    await plan.moveStartDateTimeToNextOccurrence(planToUpdate._id);
  }
};
