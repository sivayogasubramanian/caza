import { Form, DatePicker, Select, Button } from 'antd';
import Title from 'antd/lib/typography/Title';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useSWR from 'swr';
import applicationsApi from '../../api/applicationsApi';
import companiesApi, { COMPANIES_API_ENDPOINT } from '../../api/companiesApi';
import rolesApi, { ROLES_API_ENDPOINT } from '../../api/rolesApi';
import CompanyOption from '../../components/CompanyOption';
import CreateCompanyForm from '../../components/forms/CreateCompanyForm';
import CreateRoleForm from '../../components/forms/CreateRoleForm';
import { ApiResponse } from '../../types/apiResponse';
import { CompanyAutocompleteOption, CompanyListData, CompanyQueryParams } from '../../types/company';
import { RoleAutocompleteOption, RoleData, RoleListData, RoleQueryParams } from '../../types/role';
import { Nullable } from '../../types/utils';
import { createJsonResponse } from '../../utils/http/httpHelpers';
import { splitByWhitespaces } from '../../utils/strings/formatters';
import moment from 'moment';
import { roleTypeToDisplayStringMap } from '../../utils/role/roleUtils';

function ApplicationCreate() {
  const router = useRouter();

  const [isCreateCompanyFormOpen, setIsCreateCompanyFormOpen] = useState<boolean>(false);
  const [isCreateRoleFormOpen, setIsCreateRoleFormOpen] = useState<boolean>(false);

  const [companySearchParams, setCompanySearchParams] = useState<CompanyQueryParams>({ companyNames: [] });
  const [selectedCompany, setSelectedCompany] = useState<Nullable<CompanyListData>>(null);

  const [roleSearchParams, setRoleSearchParams] = useState<RoleQueryParams>({ searchWords: [] });
  const [selectedRole, setSelectedRole] = useState<Nullable<RoleData>>(null);
  const [applicationDate, setApplicationDate] = useState<Nullable<moment.Moment>>(moment(new Date()));

  const [shouldShowValidationErrors, setShouldShowValidationErrors] = useState(false);

  const { data: companiesData, mutate: mutateCompaniesData } = useSWR<ApiResponse<CompanyListData[]>>(
    [COMPANIES_API_ENDPOINT, companySearchParams],
    (url: string, companySearchParams: CompanyQueryParams) => companiesApi.getCompanies(companySearchParams),
  );
  const companies = companiesData?.payload || [];
  const companyOptions: CompanyAutocompleteOption[] = companies.map((company) => ({
    company,
    label: <CompanyOption company={company} />,
    value: company.name,
  }));
  const companyOptionsWithAdd: CompanyAutocompleteOption[] = [
    ...companyOptions,
    { company: null, label: <div>Add new company</div>, value: 'Add new company' },
  ];

  const onSelectCompany = (value: string, { company }: CompanyAutocompleteOption) => {
    setSelectedCompany(company);

    // Update role search params to filter for roles of the currently selected company
    setRoleSearchParams((prevState) => ({ ...prevState, companyId: company?.id ?? undefined }));

    if (company !== selectedCompany) {
      // Unselect role that belongs to another company
      setSelectedRole(null);
    }

    if (company === null) {
      setIsCreateCompanyFormOpen(true);
    }
  };

  const onSearchCompany = (inputValue: string) => {
    setCompanySearchParams({ companyNames: splitByWhitespaces(inputValue) });
  };

  const onCreateCompany = (company: CompanyListData) => {
    mutateCompaniesData();
    setSelectedCompany(company);
  };

  const { data: rolesData, mutate: mutateRolesData } = useSWR<ApiResponse<RoleListData[]>>(
    [ROLES_API_ENDPOINT, roleSearchParams],
    (url: string, roleSearchParams: RoleQueryParams) =>
      roleSearchParams.companyId !== undefined ? rolesApi.getRoles(roleSearchParams) : createJsonResponse([]),
  );
  const roles = rolesData?.payload || [];
  const roleOptions: RoleAutocompleteOption[] = roles.map((role) => ({
    role,
    value: `${role.title} [${role.year} ${roleTypeToDisplayStringMap.get(role.type)}]`,
  }));
  const roleOptionsWithAdd: RoleAutocompleteOption[] = [...roleOptions, { role: null, value: 'Add new role' }];

  const onSelectRole = (value: string, { role }: RoleAutocompleteOption) => {
    if (role === null && selectedCompany !== null) {
      setIsCreateRoleFormOpen(true);
    }

    setSelectedRole(role);
  };

  const onSearchRole = (inputValue: string) => {
    setRoleSearchParams((prevState) => ({ ...prevState, searchWords: splitByWhitespaces(inputValue) }));
  };

  const onCreateRole = (createdRole: RoleData) => {
    mutateRolesData();
    setSelectedRole(createdRole);
  };

  const onSubmit = () => {
    setShouldShowValidationErrors(true);

    if (selectedRole === null || applicationDate === null) {
      return;
    }

    applicationsApi
      .createApplication({
        roleId: selectedRole.id,
        // TODO: applicationDate: values.applyDate.toISOString(),
      })
      .then(() => {
        router.push('/applications');
      });
  };

  return (
    <div className="flex flex-col justify-center items-stretch min-h-screen p-8">
      <Title className="text-center">Add Application</Title>

      <CreateCompanyForm
        isOpen={isCreateCompanyFormOpen}
        closeForm={() => setIsCreateCompanyFormOpen(false)}
        onCreate={onCreateCompany}
      />

      <CreateRoleForm
        company={selectedCompany}
        isOpen={isCreateRoleFormOpen}
        closeForm={() => setIsCreateRoleFormOpen(false)}
        onCreate={onCreateRole}
      />

      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 12 }}
        size="large"
        className="flex flex-col p-8"
        onFinish={onSubmit}
      >
        <Form.Item
          label={'Company'}
          required
          validateStatus={shouldShowValidationErrors && !selectedCompany ? 'error' : 'validating'}
          help={shouldShowValidationErrors && !selectedCompany ? 'Please select a company!' : ''}
        >
          <Select
            showSearch
            options={companyOptionsWithAdd}
            onSelect={onSelectCompany}
            onSearch={onSearchCompany}
            filterOption={false} // Options are already filtered by the API, and we want to show the "Add new company" option
            value={companyOptions.find((option) => option.company?.id === selectedCompany?.id)?.value}
            loading={!companiesData}
          />
        </Form.Item>
        <Form.Item
          label={'Role'}
          required
          validateStatus={shouldShowValidationErrors && !selectedRole ? 'error' : 'validating'}
          help={shouldShowValidationErrors && !selectedRole ? 'Please select a role!' : ''}
        >
          <Select
            showSearch
            options={roleOptionsWithAdd}
            onSelect={onSelectRole}
            onSearch={onSearchRole}
            filterOption={false} // Options are already filtered by the API, and we want to show the "Add new role" option
            value={roleOptions.find((option) => option.role?.id === selectedRole?.id)?.value}
            loading={!rolesData}
          />
        </Form.Item>
        <Form.Item label="Date Applied" required>
          <DatePicker
            allowClear={false}
            defaultValue={applicationDate ?? undefined}
            onChange={(dateMoment) => {
              setApplicationDate(dateMoment);
            }}
          />
        </Form.Item>
        <Form.Item className="self-center">
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default ApplicationCreate;
