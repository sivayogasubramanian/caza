import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function NonTechnicalBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#FFD0E4', color: '#B65C87' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.NON_TECHNICAL)}
    />
  );
}

export default NonTechnicalBadge;
