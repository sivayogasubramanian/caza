import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function TechnicalBadge() {
  return <Badge count={stageTypeToDisplayStringMap.get(ApplicationStageType.TECHNICAL)} />;
}

export default TechnicalBadge;
