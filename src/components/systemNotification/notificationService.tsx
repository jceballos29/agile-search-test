import { notification } from 'antd';
import { ReactNode } from 'react';

export const successNotification = (title: string, content: ReactNode) => {
  notification.success({
    message: title,
    description: content,
    placement: 'topRight',
  });
};
export const infoNotification = (title: string, content: ReactNode) => {
  notification.info({
    message: title,
    description: content,
    placement: 'topRight',
  });
};
export const expoirerrorNotification = (title: string, content: ReactNode) => {
  notification.error({
    message: title,
    description: content,
    placement: 'topRight',
  });
};
