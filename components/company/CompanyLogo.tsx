import { Avatar } from 'antd';
import { useState } from 'react';
import { CompanyData } from '../../types/company';
import { COMPANY_LOGO_API_URL, DEFAULT_LOGO_SIZE } from '../../utils/constants';

interface Props {
  company: CompanyData;
  className?: string;
  size?: number;
}

function CompanyLogo({ company, className, size = DEFAULT_LOGO_SIZE }: Props) {
  const logoProviderUrl = `${COMPANY_LOGO_API_URL}${company.companyUrl}?size=${size}`;
  const [isLogoAvailable, setIsLogoAvailable] = useState<boolean>(true);

  if (!isLogoAvailable) {
    return <Avatar className={className}>{company.name.charAt(0)}</Avatar>;
  }

  return <img src={logoProviderUrl} onError={() => setIsLogoAvailable(false)} className={className} />;
}

export default CompanyLogo;
