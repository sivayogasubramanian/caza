import { NotificationDateTimeType, TaskFormData } from '../../types/task';
import moment from 'moment';

const TIME_FORMAT = 'HH:mm:ss';
export const DEFAULT_NOTIFICATION_TIME = moment('09:00:00', TIME_FORMAT);
export const DEFAULT_NOTIFICATION_DAYS_OFFSET = 1;

export function getIsoNotificationDateTime(values: TaskFormData) {
  const dateFormat = 'YYYY-MM-DD';
  const localDueDate = values.dueDate?.format(dateFormat);
  const localNotificationDate = values.notificationDate?.format(dateFormat);
  const localNotificationTime = values.notificationTime?.format(TIME_FORMAT);
  const localDueDateWithNotificationTime = moment(
    localDueDate + ' ' + localNotificationTime,
    `${dateFormat} ${TIME_FORMAT}`,
  );
  const localNotificationDateWithNotificationTime = moment(
    localNotificationDate + ' ' + localNotificationTime,
    `${dateFormat} ${TIME_FORMAT}`,
  );

  switch (values.notificationDateTimeType) {
    case NotificationDateTimeType.NONE:
      return null;
    case NotificationDateTimeType.DAY_OF_EVENT:
      return localDueDateWithNotificationTime.toISOString();
    case NotificationDateTimeType.DAYS_BEFORE:
      const localBeforeDueDate = localDueDateWithNotificationTime.subtract(values.notificationDaysOffset, 'days');
      return localBeforeDueDate.toISOString();
    case NotificationDateTimeType.DAYS_AFTER:
      const localAfterDueDate = localDueDateWithNotificationTime.add(values.notificationDaysOffset, 'days');
      return localAfterDueDate.toISOString();
    case NotificationDateTimeType.ON_SELECTED_DATE:
      return localNotificationDateWithNotificationTime.toISOString();
  }
}
