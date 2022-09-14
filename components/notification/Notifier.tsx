import { notification } from 'antd';
import { StatusMessage, StatusMessageType } from '../../types/apiResponse';

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

function openSuccessNotification(statusMessage: StatusMessage) {
  notification.success({
    message: statusMessage.message,
    placement: 'top',
  });
}

function openErrorNotification(statusMessage: StatusMessage) {
  notification.error({
    message: statusMessage.message,
    placement: 'top',
  });
}
