export function makeDisplayDate(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function makeDisplayNotificationDatetime(notificationDatetime: Date, dueDate: Date) {
  const numberOfDaysBeforeDueDate = calculateDaysOffset(notificationDatetime, dueDate);
  const notificationTime = makeDisplayTime(notificationDatetime);
  const dayWord = Math.abs(numberOfDaysBeforeDueDate) === 1 ? 'day' : 'days';

  if (numberOfDaysBeforeDueDate > 0) {
    return `${numberOfDaysBeforeDueDate} ${dayWord} before at ${notificationTime}`;
  }

  if (numberOfDaysBeforeDueDate < 0) {
    return `${Math.abs(numberOfDaysBeforeDueDate)} ${dayWord} after at ${notificationTime}`;
  }

  return `On day of event at ${notificationTime}`;
}

export function getCountOfDaysTillTodayFrom(date: Date): number {
  return calculateDaysOffset(date, new Date());
}

const NUMBER_OF_MILLISECONDS_IN_A_DAY = 1000 * 3600 * 24;

export function calculateDaysOffset(currentDate: Date, referenceDate: Date) {
  const startOfDay = new Date(referenceDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(referenceDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [diffFromStart, diffFromEnd] = [startOfDay, endOfDay].map((d) => d.getTime() - currentDate.getTime());

  // currentDate is between startOfDay and endOfDay
  if (diffFromEnd * diffFromStart < 0) {
    return 0;
  }

  return Math.ceil(Math.min(diffFromEnd, diffFromStart) / NUMBER_OF_MILLISECONDS_IN_A_DAY);
}

// Formats the time portion in datetime into hh:mm AM/PM format
function makeDisplayTime(dateTime: Date) {
  const notificationHourNumber = dateTime.getHours() % 12;
  const notificationHour = notificationHourNumber === 0 ? '12' : notificationHourNumber.toString();

  const notificationMinutesNumber = dateTime.getMinutes();
  const notificationMinutes =
    notificationMinutesNumber < 10 ? `0${notificationMinutesNumber}` : notificationMinutesNumber.toString();

  const amOrPm = dateTime.getHours() >= 12 ? 'PM' : 'AM';

  return `${notificationHour}:${notificationMinutes} ${amOrPm}`;
}
