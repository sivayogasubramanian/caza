import React from 'react';
import { COMPANY_LOGO_API_URL } from '../../utils/constants';

interface Props {
  companyUrl: string;
  className: string;
}

function CompanyLogo({ companyUrl, className }: Props) {
  return <img src={`${COMPANY_LOGO_API_URL}${companyUrl}`} className={className} />;
}

export default CompanyLogo;
