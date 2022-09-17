import { NotificationDateTimeType, TaskFormData } from '../../types/task';

export function getNotificationDateTime(values: TaskFormData) {
  const notificationTime = values.notificationTime?.utc().format('HH:mm:ss');

  switch (values.notificationDateTimeType) {
    case NotificationDateTimeType.NONE:
      return null;
    case NotificationDateTimeType.DAY_OF_EVENT:
      const dueDate = values.dueDate?.utc().format('YYYY-MM-DD');
      return dueDate && notificationTime ? `${dueDate}T${notificationTime}Z` : undefined;
    case NotificationDateTimeType.DAYS_BEFORE:
      const beforeDueDate = values.dueDate?.subtract(values.notificationDaysOffset, 'days').utc().format('YYYY-MM-DD');
      return beforeDueDate && notificationTime ? `${beforeDueDate}T${notificationTime}Z` : undefined;
    case NotificationDateTimeType.DAYS_AFTER:
      const afterDueDate = values.dueDate?.add(values.notificationDaysOffset, 'days').utc().format('YYYY-MM-DD');
      return afterDueDate && notificationTime ? `${afterDueDate}T${notificationTime}Z` : undefined;
    case NotificationDateTimeType.ON_SELECTED_DATE:
      const notificationDate = values.notificationDate?.utc().format('YYYY-MM-DD');
      return notificationDate && notificationTime ? `${notificationDate}T${notificationTime}Z` : undefined;
  }
}
