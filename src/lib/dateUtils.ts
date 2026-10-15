/**
 * Date utilities for Weekly navigation and Task Carry-over / Rollover logic
 */

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // midday to avoid DST shifts
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateString(d);
}

// Get the Monday of the week for a given date
export function getMondayOfWeek(dateStr: string): string {
  const d = parseDateString(dateStr);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + diffToMonday);
  return formatDateString(d);
}

// Get 7 days for the week (Monday through Sunday)
export function getWeekDates(baseDateStr: string): string[] {
  const monday = getMondayOfWeek(baseDateStr);
  const week: string[] = [];
  for (let i = 0; i < 7; i++) {
    week.push(addDays(monday, i));
  }
  return week;
}

const SPANISH_DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const SPANISH_DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function getDayNameShort(dateStr: string): string {
  const d = parseDateString(dateStr);
  return SPANISH_DAYS_SHORT[d.getDay()];
}

export function getDayNumber(dateStr: string): number {
  const d = parseDateString(dateStr);
  return d.getDate();
}

export function formatDatePretty(dateStr: string): string {
  const d = parseDateString(dateStr);
  const dayName = SPANISH_DAYS_FULL[d.getDay()];
  const dayNum = d.getDate();
  const monthName = SPANISH_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${dayNum} de ${monthName} de ${year}`;
}

export function formatShortDate(dateStr: string): string {
  const d = parseDateString(dateStr);
  return `${d.getDate()} ${SPANISH_MONTHS[d.getMonth()].substring(0, 3)}`;
}

/**
 * Filter and augment tasks for a given date according to the Carry-over / Rollover requirement:
 * 
 * "tener la opción de tomarlas en el día, y las otras agendarlas para otros días,
 * sin embargo las tareas del día deberían irse acumulando conforme pase el tiempo,
 * es decir que si hoy tengo asignadas 3 tareas, y mañana 4, de estas termino 2 el día de hoy,
 * quiere decir que mi tablero el día de mañana debería tener 5 tareas."
 */
export function getTasksForDate<T extends { 
  scheduled_date: string; 
  status: string; 
  completed_at?: string | null; 
}>(tasks: T[], targetDate: string): (T & { isRolledOver: boolean; originalDate: string })[] {
  return tasks
    .filter((task) => {
      // If completed: it belongs ONLY to the date it was finished
      if (task.status === 'finalizada') {
        const finishDate = task.completed_at 
          ? task.completed_at.slice(0, 10) 
          : task.scheduled_date;
        return finishDate === targetDate;
      }

      // If pending ('asignada' or 'en_curso'):
      // It appears on targetDate if scheduled on targetDate OR rolled over from an earlier date!
      return task.scheduled_date <= targetDate;
    })
    .map((task) => {
      const isRolledOver = task.status !== 'finalizada' && task.scheduled_date < targetDate;
      return {
        ...task,
        isRolledOver,
        originalDate: task.scheduled_date,
      };
    });
}
