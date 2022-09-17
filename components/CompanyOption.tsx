import { Col, Row } from 'antd';
import { CompanyData } from '../types/company';
import CompanyLogo from './company/CompanyLogo';

type Props = {
  company: CompanyData;
};

function CompanyOption({ company }: Props) {
  return (
    <Row gutter={18} align="middle">
      <Col>
        <CompanyLogo company={company} className="rounded-full w-8" />
      </Col>
      <Col>{company.name}</Col>
    </Row>
  );
}

export default CompanyOption;
