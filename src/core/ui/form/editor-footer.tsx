import React, { FC, useMemo, useState } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Badge, Divider, Row } from "antd"

interface FooterProps {
  total?: number
  size?: number
}

const Footer: FC<FooterProps & WithTranslation> = ({ t, total, size, ...props }) => {
  return (
    <div>
      <div>
        {props.children}
      </div>
      <Divider style={{ margin: '4px 0' }} />
      <div style={{ margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ margin: '4px' }}>
          {total && size && <Badge
            className="site-badge-count"
            count={`${size} / ${total}`}
          />}
        </div>
        <div style={{ textAlign: 'center', maxWidth: '300px', }}>
          {t("Showing only part of the results. Search to find the one you need.")}
        </div>
      </div>
    </div>
  )
 
}

export default withTranslation()(Footer)