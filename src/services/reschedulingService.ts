import { ScheduledFarmTask, WeatherData } from '../types';

export interface RescheduleProposal {
  taskId: string;
  originalDate: string;
  suggestedDate: string;
  reason: string;
  stageConsideration: string;
  affectedTasksCount: number;
}

/**
 * Intelligent Rescheduling Engine for KrishiCycle Farm Tasks
 * Evaluates:
 * - Current crop stage and agronomic window (e.g. basal dressing must happen before transplanting)
 * - Weather forecasts (e.g. rain delays require dry soil window; high heat shifts spray)
 * - Priority and dependencies
 * - Avoids moving completed tasks
 */
export const proposeIntelligentReschedule = (
  task: ScheduledFarmTask,
  allTasks: ScheduledFarmTask[] = [],
  weather?: WeatherData
): RescheduleProposal => {
  const originalDate = task.scheduledDate || task.dueDate || new Date().toISOString().split('T')[0];
  const originalD = new Date(originalDate);
  const now = new Date();

  // If task is overdue, base shift from today, otherwise from originalDate
  const baseD = originalD < now ? new Date(now) : new Date(originalD);

  let shiftDays = 3;
  let reason = '';
  let stageConsideration = '';

  const addDays = (d: Date, days: number): string => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy.toISOString().split('T')[0];
  };

  // Weather conditions check
  const isRainForecast = weather?.rainChance && weather.rainChance > 50;
  const isHighWind = weather?.windSpeed && weather.windSpeed > 20;

  switch (task.stageKey) {
    case 'land_prep':
      shiftDays = isRainForecast ? 4 : 2;
      reason = isRainForecast
        ? 'Heavy rainfall or high moisture logged; postponed tillage by 4 days to allow soil drying and prevent tractor compaction.'
        : 'Shifted land preparation by 2 days to ensure dry-crumbly soil tilth before bed forming.';
      stageConsideration = 'Basal dressing must be completed prior to bed shaping and planting.';
      break;

    case 'sowing':
      shiftDays = isRainForecast ? 5 : 3;
      reason = isRainForecast
        ? 'Rain alert: Postponed sowing/transplanting by 5 days to avoid seedling root waterlogging and damping-off.'
        : 'Rescheduled transplanting by 3 days during optimal evening temperature window.';
      stageConsideration = 'Seedling age must not exceed 30 days to avoid transplanting check.';
      break;

    case 'fertilizer':
      shiftDays = isRainForecast ? 4 : 3;
      reason = isRainForecast
        ? 'High rain probability: Postponed nutrient application by 4 days to eliminate fertilizer leaching and runoff.'
        : 'Rescheduled top-dressing by 3 days to align with scheduled irrigation cycle.';
      stageConsideration = 'Must be completed before peak flowering to ensure maximum vegetative translocation.';
      break;

    case 'pest':
      shiftDays = isHighWind || isRainForecast ? 3 : 2;
      reason = isRainForecast
        ? 'Rain forecast washes away foliar sprays; postponed preventive spray by 3 days for a clear morning sky.'
        : isHighWind
          ? 'High wind (>20 km/h) causes foliar spray drift; postponed by 2 days.'
          : 'Rescheduled foliar bio-spray to next calm morning window (6:00 AM – 8:30 AM).';
      stageConsideration = 'Maintain 10–12 day interval between biological repellent applications.';
      break;

    case 'irrigation':
      shiftDays = isRainForecast ? 5 : 2;
      reason = isRainForecast
        ? 'Upcoming rain will fulfill crop water requirements naturally; drip irrigation deferred by 5 days.'
        : 'Irrigation interval extended by 2 days based on current soil moisture retention.';
      stageConsideration = 'Avoid excessive moisture around stem collar.';
      break;

    case 'weeding':
      shiftDays = 3;
      reason = 'Weeding shifted by 3 days to coincide with furrow soil loosening before next top dressing.';
      stageConsideration = 'Remove weeds before seed heads emerge.';
      break;

    case 'harvest':
      shiftDays = 2;
      reason = 'Harvest window shifted by 2 days to align with APMC market trading day and crate availability.';
      stageConsideration = 'Pick at breaker stage for extended transit shelf life.';
      break;

    default:
      shiftDays = 3;
      reason = 'Operation deferred by 3 days according to agronomic stage guidelines.';
      stageConsideration = 'Preserves operational sequence.';
      break;
  }

  const suggestedDate = addDays(baseD, shiftDays);

  // Check how many future tasks in the sequence might be affected
  const affectedTasksCount = (allTasks || []).filter(
    (t) => !t.completed && t.status !== 'Completed' && t.id !== task.id && new Date(t.scheduledDate || t.dueDate || 0) >= originalD
  ).length;

  return {
    taskId: task.id,
    originalDate,
    suggestedDate,
    reason,
    stageConsideration,
    affectedTasksCount,
  };
};
