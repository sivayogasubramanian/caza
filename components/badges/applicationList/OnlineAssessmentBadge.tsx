import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function OnlineAssessmentBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#ACF8FF', color: '#000000' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.ONLINE_ASSESSMENT)}
    />
  );
}

export default OnlineAssessmentBadge;