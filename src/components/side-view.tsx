import React, { FC } from 'react';
import { Drawer } from 'antd';

type Props = {
  visible: boolean;
  onClose: () => void;
  width?: number;
  mask?: boolean;
  getContainer?: any;
  className?: string;
};

const SideView: FC<Props> = ({ children, visible, onClose, width, mask, getContainer, className }) => {
  return (
    <Drawer
      className={'side-view ' + className}
      width={width ?? 650}
      placement="right"
      closable={true}
      onClose={() => {
        onClose();
      }}
      visible={visible}
      mask={mask}
      getContainer={getContainer}
    >
      {children}
    </Drawer>
  );
};

export default SideView;
