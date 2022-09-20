import { notification } from 'antd';
import { StatusMessage, StatusMessageType } from '../../types/apiResponse';
import { log } from '../../utils/analytics';

export function openNotification(statusMessage: StatusMessage) {
  switch (statusMessage.type) {
    case StatusMessageType.SUCCESS:
      openSuccessNotification(statusMessage);
      break;
    case StatusMessageType.ERROR:
      openErrorNotification(statusMessage);
      break;
    default:
      return;
  }
}

function openSuccessNotification({ message }: StatusMessage) {
  log('success_notification', { message });
  notification.success({
    message,
    placement: 'top',
  });
}

function openErrorNotification({ message }: StatusMessage) {
  log('error_notification', { message });
  notification.error({
    message,
    placement: 'top',
  });
}
