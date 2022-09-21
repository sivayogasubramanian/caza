import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function OnlineAssessmentBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#D0ACFF', color: '#9E3CCC' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.ONLINE_ASSESSMENT)}
    />
  );
}

export default OnlineAssessmentBadge;
