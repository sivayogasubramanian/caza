import React from 'react';
import { COMPANY_LOGO_API_URL, DEFAULT_LOGO_SIZE } from '../../utils/constants';

interface Props {
  companyUrl: string;
  className?: string;
  size?: number;
}

function CompanyLogo({ companyUrl, className, size = DEFAULT_LOGO_SIZE }: Props) {
  return <img src={`${COMPANY_LOGO_API_URL}${companyUrl}?size=${size}`} className={className} />;
}

export default CompanyLogo;
