import { CropTask, ScheduledFarmTask, WeeklyCheckinRecord } from '../types';
import { generateWeeklyFarmSchedule } from './resourceService';

export const generateCropCycleTasks = (
  cropId: string,
  startDateStr?: string,
  fieldAcres: number = 2.5
): ScheduledFarmTask[] => {
  return generateWeeklyFarmSchedule(cropId, fieldAcres, startDateStr);
};

export const applyWeeklyCheckinAdjustment = (
  tasks: ScheduledFarmTask[],
  checkin: {
    progress: string;
    problems: string;
    waterStatus: 'normal' | 'low' | 'adequate';
    weatherDelay: 'none' | 'rain' | 'heat';
  }
): { updatedTasks: ScheduledFarmTask[]; record: WeeklyCheckinRecord } => {
  let explanation = '';
  const updatedTasks = [...tasks];

  // Rule 1: Rain delay
  if (checkin.weatherDelay === 'rain') {
    explanation += 'Heavy rainfall logged: Upcoming sowing and fertilizer operations shifted forward by 5 days to allow soil drying. ';
    for (let i = 0; i < updatedTasks.length; i++) {
      if (updatedTasks[i].status !== 'Completed' && !updatedTasks[i].completed) {
        const d = new Date(updatedTasks[i].scheduledDate);
        d.setDate(d.getDate() + 5);
        const newDate = d.toISOString().split('T')[0];
        updatedTasks[i] = {
          ...updatedTasks[i],
          scheduledDate: newDate,
          dueDate: newDate,
          notes: `${updatedTasks[i].notes} [Rain delay: rescheduled +5 days]`,
          status: 'Rescheduled',
          rescheduleReason: 'Weather adjustment: heavy monsoon rainfall logged in check-in.',
        };
      }
    }
  }

  // Rule 2: Low water
  if (checkin.waterStatus === 'low') {
    explanation += 'Low water reported: Added emergency mulch and drip interval conservation check task. ';
    const emergencyTask: ScheduledFarmTask = {
      id: `task_emergency_${Date.now()}`,
      cropId: tasks[0]?.cropId || 'crop_tomato',
      weekNumber: 3,
      scheduledDate: new Date().toISOString().split('T')[0],
      cropStage: 'Emergency Water Conservation',
      stageKey: 'irrigation',
      title: 'Water Conservation: Apply Dry Biomass Mulch & Adjust Drip Run Time',
      description: 'Water scarcity detected during check-in: spread 5 cm straw mulch over beds and shift irrigation to evening.',
      resourceRequired: '500 kg Crop Residue Mulch',
      plannedQuantity: 500,
      resourceUnit: 'kg',
      waterRequirementLiters: 0,
      labourRequiredDays: 2,
      priority: 'High',
      status: 'Pending',
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      notes: 'Plan updated because water stress was detected in weekly check-in.',
      guideVideoTitle: 'Emergency Drought Mulching on Vegetable Beds',
      checklist: [
        'Cover exposed beds with 5-8 cm dry stubble mulch',
        'Shift irrigation to late night to eliminate evaporative loss',
        'Inspect drip emitters for clogging',
      ],
    };
    updatedTasks.splice(2, 0, emergencyTask);
  }

  if (!explanation) {
    explanation = 'Crop progress verified on schedule. No schedule adjustments needed.';
  }

  const record: WeeklyCheckinRecord = {
    id: `chk_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    progress: checkin.progress,
    problems: checkin.problems,
    waterStatus: checkin.waterStatus,
    weatherDelay: checkin.weatherDelay,
    explanation,
  };

  return { updatedTasks, record };
};
