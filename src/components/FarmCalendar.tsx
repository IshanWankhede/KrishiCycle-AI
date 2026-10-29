import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  AlertTriangle,
  RotateCcw,
  Plus,
  Download,
  ExternalLink,
  Filter,
  CheckCircle2,
  CalendarCheck2,
  Sliders,
  Layers,
  Sparkles,
  Info,
  X,
  Play,
} from 'lucide-react';
import { ScheduledFarmTask, FarmResourceItem, WeatherData } from '../types';
import { proposeIntelligentReschedule } from '../services/reschedulingService';
import { useT } from '../i18n/useT';

interface FarmCalendarProps {
  tasks: ScheduledFarmTask[];
  farmResources: FarmResourceItem[];
  weather?: WeatherData;
  defaultViewMode?: 'month' | 'week' | 'agenda' | 'cycle';
  onCompleteTask: (taskId: string, actualQuantityUsed?: number, notes?: string) => void;
  onRescheduleTask: (taskId: string, newDate: string, reason?: string) => void;
  onAddTask: (task: ScheduledFarmTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onPlayVideo?: (videoTitle: string) => void;
}

export const FarmCalendar: React.FC<FarmCalendarProps> = ({
  tasks,
  farmResources,
  weather,
  defaultViewMode = 'cycle',
  onCompleteTask,
  onRescheduleTask,
  onAddTask,
  onDeleteTask,
  onPlayVideo,
}) => {
  const { t } = useT();

  // Active view
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda' | 'cycle'>(defaultViewMode);

  // Calendar anchor date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');

  // Modals state
  const [completingTask, setCompletingTask] = useState<ScheduledFarmTask | null>(null);
  const [actualQtyUsed, setActualQtyUsed] = useState<number>(0);
  const [completionNotes, setCompletionNotes] = useState<string>('');

  const [reschedulingTask, setReschedulingTask] = useState<ScheduledFarmTask | null>(null);
  const [proposedReschedule, setProposedReschedule] = useState<{
    suggestedDate: string;
    reason: string;
    stageConsideration: string;
  } | null>(null);
  const [customRescheduleDate, setCustomRescheduleDate] = useState<string>('');
  const [customRescheduleReason, setCustomRescheduleReason] = useState<string>('');

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDate, setNewTaskDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTaskStage, setNewTaskStage] = useState<string>('Fertilizer Application');
  const [newTaskResource, setNewTaskResource] = useState<string>('Vermicompost');
  const [newTaskQty, setNewTaskQty] = useState<number>(100);
  const [newTaskUnit, setNewTaskUnit] = useState<string>('kg');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Safeguard tasks array
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Filtered tasks
  const filteredTasks = safeTasks.filter((task) => {
    const taskStatus = (task?.status || ((task as any)?.completed ? 'Completed' : 'Upcoming')).toLowerCase();
    const taskStage = (task?.cropStage || (task as any)?.stageKey || (task as any)?.stage || '').toLowerCase();

    if (statusFilter !== 'all' && taskStatus !== statusFilter.toLowerCase()) {
      return false;
    }
    if (stageFilter !== 'all' && !taskStage.includes(stageFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Calendar Navigation
  const handlePrev = () => {
    const copy = new Date(currentDate);
    if (viewMode === 'week') {
      copy.setDate(copy.getDate() - 7);
    } else {
      copy.setMonth(copy.getMonth() - 1);
    }
    setCurrentDate(copy);
  };

  const handleNext = () => {
    const copy = new Date(currentDate);
    if (viewMode === 'week') {
      copy.setDate(copy.getDate() + 7);
    } else {
      copy.setMonth(copy.getMonth() + 1);
    }
    setCurrentDate(copy);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Open Completion Modal
  const openCompleteModal = (task: ScheduledFarmTask) => {
    setCompletingTask(task);
    setActualQtyUsed(task.plannedQuantity || 100);
    setCompletionNotes('');
  };

  const handleConfirmCompletion = () => {
    if (!completingTask) return;
    onCompleteTask(completingTask.id, actualQtyUsed, completionNotes);
    setCompletingTask(null);
  };

  // Open Reschedule Modal
  const openRescheduleModal = (task: ScheduledFarmTask) => {
    setReschedulingTask(task);
    const proposal = proposeIntelligentReschedule(task, safeTasks, weather);
    setProposedReschedule(proposal);
    setCustomRescheduleDate(proposal.suggestedDate);
    setCustomRescheduleReason(proposal.reason);
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingTask || !customRescheduleDate) return;
    onRescheduleTask(reschedulingTask.id, customRescheduleDate, customRescheduleReason);
    setReschedulingTask(null);
    setProposedReschedule(null);
  };

  // Handle Add Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const created: ScheduledFarmTask = {
      id: `task_custom_${Date.now()}`,
      cropId: safeTasks[0]?.cropId || 'crop_tomato',
      weekNumber: 1,
      scheduledDate: newTaskDate,
      dueDate: newTaskDate,
      cropStage: newTaskStage,
      stage: newTaskStage,
      stageKey: newTaskStage.toLowerCase().includes('fert')
        ? 'fertilizer'
        : newTaskStage.toLowerCase().includes('irr')
          ? 'irrigation'
          : newTaskStage.toLowerCase().includes('sow')
            ? 'sowing'
            : 'land_prep',
      title: newTaskTitle,
      description: `Farmer added operation for ${newTaskStage}.`,
      resourceRequired: `${newTaskQty} ${newTaskUnit} ${newTaskResource}`,
      plannedQuantity: newTaskQty,
      resourceUnit: newTaskUnit,
      priority: newTaskPriority,
      status: 'Upcoming',
      completed: false,
      checklist: ['Execute as planned on schedule', 'Log actual consumption after operation'],
      notes: 'Custom task created by farmer.',
    };

    onAddTask(created);
    setIsAddModalOpen(false);
    setNewTaskTitle('');
  };

  // Export iCalendar (.ics) format
  const handleExportICS = () => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const formatICSDate = (dStr: string) => {
      try {
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T090000Z`;
      } catch {
        return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      }
    };

    let icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//KrishiCycle AI//Farm Calendar//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n`;

    safeTasks.forEach((t) => {
      const taskDate = t.scheduledDate || (t as any).dueDate || new Date().toISOString().split('T')[0];
      const dtStart = formatICSDate(taskDate);
      const summary = (t.title || 'Farm Task').replace(/[,;]/g, ' ');
      const desc = `${t.description || ''} Resource: ${t.resourceRequired || ''}. Status: ${t.status || 'Upcoming'}`.replace(/[,;]/g, ' ');

      icsContent += `BEGIN:VEVENT\r\nUID:${t.id || Date.now()}@krishicycle.ai\r\nDTSTAMP:${dtStart}\r\nDTSTART:${dtStart}\r\nSUMMARY:${summary}\r\nDESCRIPTION:${desc}\r\nSTATUS:${t.status === 'Completed' || (t as any).completed ? 'COMPLETED' : 'CONFIRMED'}\r\nEND:VEVENT\r\n`;
    });

    icsContent += `END:VCALENDAR\r\n`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `krishicycle_farm_schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct Google Calendar Add Link for a Task
  const getGoogleCalendarUrl = (task: ScheduledFarmTask) => {
    const rawDate = task.scheduledDate || (task as any).dueDate || new Date().toISOString().split('T')[0];
    const dStr = rawDate.replace(/-/g, '');
    const title = encodeURIComponent(task.title || 'Farm Operation');
    const checklistStr = Array.isArray(task.checklist) ? task.checklist.join('\n') : '';
    const details = encodeURIComponent(
      `${task.description || ''}\n\nStage: ${task.cropStage || (task as any).stage || ''}\nResource Required: ${task.resourceRequired || ''}\nChecklist:\n${checklistStr}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dStr}/${dStr}&details=${details}&location=Farm+Field`;
  };

  // Month Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* 1. TOP CALENDAR CONTROLS & HEADER */}
      <div className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                Internal Farm Schedule & Operations
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-darkcard border border-white/10 text-emerald-300">
                100% Offline Functional
              </span>
            </div>
            <h3 className="text-2xl font-display font-extrabold text-white">
              Farm Management Calendar
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Track nutrient applications, irrigation windows, weeding and harvest dates.
            </p>
          </div>

          {/* Action Buttons: Add Task & Export iCal */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Farm Task</span>
            </button>

            <button
              onClick={handleExportICS}
              className="px-4 py-2 rounded-full liquid-glass hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-all"
              title="Download standard .ics file for Google Calendar, Apple Calendar or Outlook"
            >
              <Download className="w-3.5 h-3.5 text-lime" />
              <span>Export Calendar (.ics)</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher + Month Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/10">
          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full liquid-glass hover:bg-white/10 text-white border border-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-full liquid-glass hover:bg-white/10 text-xs font-mono font-bold text-lime border border-lime/30"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full liquid-glass hover:bg-white/10 text-white border border-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-base font-display font-bold text-white min-w-[160px]">
              {monthName}
            </span>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-surface-dark p-1 rounded-full border border-white/10">
            {(
              [
                { id: 'agenda', label: 'Agenda List' },
                { id: 'month', label: 'Month View' },
                { id: 'week', label: 'Week View' },
                { id: 'cycle', label: 'Crop Cycle' },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  viewMode === v.id
                    ? 'bg-lime text-ink font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-lime" />
            <span className="text-neutral-400">Status Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-dark border border-neutral-700 rounded-full px-3 py-1 text-xs text-white"
            >
              <option value="all">All Statuses ({tasks.length})</option>
              <option value="upcoming">Upcoming</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Stage Filter:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-surface-dark border border-neutral-700 rounded-full px-3 py-1 text-xs text-white"
            >
              <option value="all">All Growth Stages</option>
              <option value="prep">Land Preparation</option>
              <option value="sowing">Sowing & Planting</option>
              <option value="fertilizer">Fertilizer Application</option>
              <option value="irrigation">Irrigation</option>
              <option value="weeding">Weeding & Mulching</option>
              <option value="pest">Pest Monitoring</option>
              <option value="harvest">Harvesting</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. CALENDAR VIEWS */}

      {/* VIEW A: AGENDA / LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-4xl bg-surface-card border border-white/5 text-neutral-400">
              <CalendarCheck2 className="w-12 h-12 text-lime/40 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-white">No tasks match current filters</h4>
              <p className="text-xs mt-1">Try resetting the status or stage filters above.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-6 rounded-4xl border transition-all ${
                  task.status === 'Completed'
                    ? 'bg-surface-card/60 border-emerald-900/40 text-neutral-400'
                    : task.status === 'Rescheduled'
                      ? 'bg-surface-card border-amber-500/30'
                      : 'bg-surface-card border-surface-darkborder shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Status icon & task info */}
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => openCompleteModal(task)}
                      disabled={task.status === 'Completed'}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        task.status === 'Completed'
                          ? 'bg-lime border-lime text-ink'
                          : 'border-neutral-600 hover:border-lime bg-surface-dark text-neutral-400'
                      }`}
                      title={task.status === 'Completed' ? 'Task completed' : 'Click to complete and update inventory'}
                    >
                      {task.status === 'Completed' ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-surface-dark border border-white/10 text-lime font-bold">
                          Week {task.weekNumber} · {task.cropStage}
                        </span>
                        <span className="text-xs font-mono text-neutral-300 flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-lime" />
                          <span>{task.scheduledDate}</span>
                        </span>
                        {task.originalDate && task.originalDate !== task.scheduledDate && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Rescheduled from {task.originalDate}
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-lg font-bold ${
                          task.status === 'Completed' ? 'line-through text-neutral-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-xs text-neutral-300 mt-1">{task.description}</p>

                      {/* Resource badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                        <span className="px-3 py-1 rounded-full bg-surface-dark border border-white/10 text-emerald-300 font-mono">
                          Resource: <strong>{task.resourceRequired}</strong>
                        </span>
                        {task.waterRequirementLiters ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20 font-mono text-[11px]">
                            💧 {task.waterRequirementLiters.toLocaleString()} L water
                          </span>
                        ) : null}
                        {task.labourRequiredDays ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px]">
                            👥 {task.labourRequiredDays} person-days
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end gap-2 shrink-0">
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                        task.status === 'Completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : task.status === 'Rescheduled'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-surface-dark text-neutral-300 border border-white/10'
                      }`}
                    >
                      {task.status}
                    </span>

                    {task.status !== 'Completed' && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          onClick={() => openCompleteModal(task)}
                          className="px-3 py-1.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-sm transition-all"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => openRescheduleModal(task)}
                          className="px-3 py-1.5 rounded-full liquid-glass hover:bg-white/10 text-xs text-white border border-white/10 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-400" />
                          <span>Reschedule</span>
                        </button>
                        <a
                          href={getGoogleCalendarUrl(task)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-full liquid-glass hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10"
                          title="Add single task to Google Calendar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checklist items */}
                {task.checklist && task.checklist.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
                      Action Checklist:
                    </div>
                    {task.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-lime shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW B: MONTH VIEW GRID */}
      {viewMode === 'month' && (
        <div className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-3">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-neutral-400 pb-2 border-b border-white/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty prefix cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty_${i}`} className="h-24 rounded-2xl bg-surface-dark/30 border border-white/5 opacity-30" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const padDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const padMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
              const dateKey = `${year}-${padMonth}-${padDay}`;

              const dayTasks = safeTasks.filter((t) => (t.scheduledDate || (t as any).dueDate) === dateKey);
              const isToday = new Date().toISOString().split('T')[0] === dateKey;

              return (
                <div
                  key={dayNum}
                  className={`h-28 p-2 rounded-2xl border flex flex-col justify-between overflow-hidden transition-all ${
                    isToday
                      ? 'bg-primary-dark/30 border-lime shadow-glow-lime'
                      : dayTasks.length > 0
                        ? 'bg-surface-dark border-white/10 hover:border-lime/40'
                        : 'bg-surface-dark/60 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday ? 'text-lime' : 'text-neutral-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto no-scrollbar">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => openCompleteModal(t)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer transition-colors ${
                          t.status === 'Completed' || (t as any).completed
                            ? 'bg-emerald-950/80 text-emerald-300 line-through'
                            : 'bg-lime/20 text-lime hover:bg-lime hover:text-ink'
                        }`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW C: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(currentDate);
              const dayOfWeek = d.getDay();
              d.setDate(d.getDate() - dayOfWeek + i);
              const dateStr = d.toISOString().split('T')[0];
              const dayTasks = safeTasks.filter((t) => (t.scheduledDate || (t as any).dueDate) === dateStr);
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <div
                  key={i}
                  className="p-3 rounded-3xl bg-surface-dark border border-white/10 min-h-[260px] flex flex-col justify-between"
                >
                  <div className="border-b border-white/10 pb-2 mb-2">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">{dayName}</div>
                    <div className="text-sm font-bold text-white">{d.getDate()}</div>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
                    {dayTasks.length === 0 ? (
                      <div className="text-[10px] text-neutral-500 italic text-center py-6">
                        No operations
                      </div>
                    ) : (
                      dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-2 rounded-xl bg-surface-card border border-white/5 text-xs space-y-1"
                        >
                          <div className="font-bold text-white text-[11px] truncate">{t.title}</div>
                          <div className="text-[10px] text-lime font-mono">{t.resourceRequired || 'Planned item'}</div>
                          <button
                            onClick={() => openCompleteModal(t)}
                            className="w-full mt-1 py-1 rounded bg-white/5 hover:bg-lime hover:text-ink text-[10px] font-bold text-neutral-300 transition-colors"
                          >
                            {t.status === 'Completed' || (t as any).completed ? 'Done' : 'Mark Done'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW D: CROP CYCLE TIMELINE */}
      {viewMode === 'cycle' && (
        <div className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-6">
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-lime before:via-teal before:to-emerald-800">
            {safeTasks.map((task, idx) => (
              <div key={task.id} className="relative group">
                <div
                  className={`absolute -left-[27px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    task.status === 'Completed' || (task as any).completed
                      ? 'bg-lime border-lime text-ink'
                      : 'bg-surface-dark border-neutral-600 text-white'
                  }`}
                >
                  {task.status === 'Completed' || (task as any).completed ? '✓' : idx + 1}
                </div>

                <div className="p-5 rounded-3xl bg-surface-dark border border-white/10 hover:border-lime/30 transition-all space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-lime font-bold uppercase">
                      Week {task.weekNumber || (idx + 1)} · {task.cropStage || (task as any).stage || 'Stage'}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">Date: {task.scheduledDate || (task as any).dueDate}</span>
                  </div>

                  <h4 className="text-base font-bold text-white">{task.title}</h4>
                  <p className="text-xs text-neutral-300">{task.description}</p>
                  <div className="text-xs font-mono text-emerald-300">
                    Required: <strong>{task.resourceRequired}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MODAL: TASK COMPLETION & INVENTORY DEDUCTION */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md liquid-glass rounded-3xl p-6 border border-lime/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-lime text-ink flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Complete Task</h3>
                  <span className="text-[10px] font-mono text-lime">Records Actual Consumption</span>
                </div>
              </div>
              <button
                onClick={() => setCompletingTask(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/10 text-xs space-y-1">
              <div className="font-bold text-white">{completingTask.title}</div>
              <div className="text-neutral-400">{completingTask.cropStage || (completingTask as any).stage || 'Stage'}</div>
              <div className="text-lime font-mono">Planned: {completingTask.plannedQuantity || 0} {completingTask.resourceUnit || 'kg'} ({completingTask.resourceRequired || 'Planned item'})</div>
            </div>

            {/* Input actual quantity used */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-300 font-medium block">
                Actual Resource Quantity Used ({completingTask.resourceUnit || 'kg'})
              </label>
              <input
                type="number"
                min={0}
                value={actualQtyUsed}
                onChange={(e) => setActualQtyUsed(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-lime outline-none"
              />
              <span className="text-[11px] text-neutral-400 block">
                Deducts {actualQtyUsed} {completingTask.resourceUnit || 'kg'} from your farm inventory exactly once.
              </span>
            </div>

            {/* Completion Notes */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-300 font-medium block">
                Field Notes / Observations (Optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="e.g. Applied via drip; soil absorbed moisture uniformly..."
                rows={2}
                className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-lime outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCompletingTask(null)}
                className="px-4 py-2 rounded-full liquid-glass hover:bg-white/10 text-xs text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompletion}
                className="px-5 py-2.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm & Update Inventory</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: INTELLIGENT RESCHEDULE */}
      {reschedulingTask && proposedReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg liquid-glass rounded-3xl p-6 border border-amber-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Intelligent Reschedule</h3>
                  <span className="text-[10px] font-mono text-amber-300">Agronomic Rules Engine</span>
                </div>
              </div>
              <button
                onClick={() => setReschedulingTask(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/10 text-xs space-y-1">
              <div className="font-bold text-white">{reschedulingTask.title}</div>
              <div className="text-neutral-400">Current Date: <strong className="text-white">{reschedulingTask.scheduledDate || (reschedulingTask as any).dueDate}</strong></div>
            </div>

            {/* AI Agronomic Suggestion Box */}
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Proposed Date: {proposedReschedule.suggestedDate}</span>
              </div>
              <p className="text-neutral-200 leading-relaxed">{proposedReschedule.reason}</p>
              <div className="text-[11px] text-amber-200/80 italic">
                Rule: {proposedReschedule.stageConsideration}
              </div>
            </div>

            {/* Custom Date Picker */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-300 font-medium block">
                Adjust Proposed Date
              </label>
              <input
                type="date"
                value={customRescheduleDate}
                onChange={(e) => setCustomRescheduleDate(e.target.value)}
                className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-4 py-2 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            {/* Custom Reason */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-300 font-medium block">
                Reason / Log Note
              </label>
              <input
                type="text"
                value={customRescheduleReason}
                onChange={(e) => setCustomRescheduleReason(e.target.value)}
                className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReschedulingTask(null)}
                className="px-4 py-2 rounded-full liquid-glass hover:bg-white/10 text-xs text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-5 py-2.5 rounded-full bg-amber-400 text-ink font-bold text-xs hover:bg-amber-300 transition-all shadow-md"
              >
                Accept & Reschedule Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: ADD CUSTOM TASK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-md liquid-glass rounded-3xl p-6 border border-lime/30 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-lime" />
                <span>Add Custom Farm Task</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-neutral-300 block mb-1">Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Apply Vermicompost in Furrows"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-lime outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-300 block mb-1">Scheduled Date</label>
                <input
                  type="date"
                  required
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">Growth Stage</label>
                <select
                  value={newTaskStage}
                  onChange={(e) => setNewTaskStage(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Land Preparation">Land Preparation</option>
                  <option value="Sowing / Planting">Sowing / Planting</option>
                  <option value="Fertilizer Application">Fertilizer Application</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Weeding & Mulching">Weeding & Mulching</option>
                  <option value="Pest & Disease Control">Pest & Disease Control</option>
                  <option value="Harvesting">Harvesting</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs text-neutral-300 block mb-1">Resource Required</label>
                <input
                  type="text"
                  placeholder="e.g. Vermicompost"
                  value={newTaskResource}
                  onChange={(e) => setNewTaskResource(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">Quantity (kg/L)</label>
                <input
                  type="number"
                  min={1}
                  value={newTaskQty}
                  onChange={(e) => setNewTaskQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-full liquid-glass hover:bg-white/10 text-xs text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime"
              >
                Add to Calendar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
