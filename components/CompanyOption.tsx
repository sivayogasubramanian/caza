import { Col, Row } from 'antd';
import { CompanyData } from '../types/company';
import { COMPANY_LOGO_API_URL } from '../utils/constants';

type Props = {
  company: CompanyData;
};

function makeLogoUrl(companyUrl: string): string {
  return `${COMPANY_LOGO_API_URL}/${companyUrl}?size=${25}`;
}

function CompanyOption({ company }: Props) {
  const { name, companyUrl } = company;

  return (
    <Row gutter={18} align="middle">
      <Col>
        <img src={makeLogoUrl(companyUrl)} />
      </Col>
      <Col>{name}</Col>
    </Row>
  );
}

export default CompanyOption;
