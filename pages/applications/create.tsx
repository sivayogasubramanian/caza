import { Form, DatePicker, Select } from 'antd';
import { useState } from 'react';
import useSWR from 'swr';
import companiesApi, { COMPANIES_API_ENDPOINT } from '../../api/companiesApi';
import rolesApi, { ROLES_API_ENDPOINT } from '../../api/rolesApi';
import CompanyOption from '../../components/CompanyOption';
import CreateCompanyForm from '../../components/forms/CreateCompanyForm';
import CreateRoleForm from '../../components/forms/CreateRoleForm';
import { ApiResponse } from '../../types/apiResponse';
import { CompanyAutocompleteOption, CompanyListData, CompanyQueryParams } from '../../types/company';
import { RoleAutocompleteOption, RoleData, RoleListData, RoleQueryParams, RoleTypeToLabelMap } from '../../types/role';
import { Nullable } from '../../types/utils';
import { createJsonResponse } from '../../utils/http/httpHelpers';
import { splitByWhitespaces } from '../../utils/strings/formatters';

function ApplicationCreate() {
  const [isCreateCompanyFormOpen, setIsCreateCompanyFormOpen] = useState<boolean>(false);
  const [isCreateRoleFormOpen, setIsCreateRoleFormOpen] = useState<boolean>(false);

  const [companySearchParams, setCompanySearchParams] = useState<CompanyQueryParams>({ companyNames: [] });
  const [selectedCompany, setSelectedCompany] = useState<Nullable<CompanyListData>>(null);

  const [roleSearchParams, setRoleSearchParams] = useState<RoleQueryParams>({ searchWords: [] });
  const [selectedRoleId, setSelectedRoleId] = useState<Nullable<number>>(null);

  const { data: companiesData, mutate } = useSWR<ApiResponse<CompanyListData[]>>(
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
      setSelectedRoleId(null);
    }

    if (company === null) {
      setIsCreateCompanyFormOpen(true);
    }
  };

  const onSearchCompany = (inputValue: string) => {
    setCompanySearchParams({ companyNames: splitByWhitespaces(inputValue) });
  };

  const onCreateCompany = (company: CompanyListData) => {
    setSelectedCompany(company);
  };

  const { data: rolesData } = useSWR<ApiResponse<RoleListData[]>>(
    [ROLES_API_ENDPOINT, roleSearchParams],
    (url: string, roleSearchParams: RoleQueryParams) =>
      roleSearchParams.companyId !== undefined ? rolesApi.getRoles(roleSearchParams) : createJsonResponse([]),
  );
  const roles = rolesData?.payload || [];
  const roleOptions: RoleAutocompleteOption[] = roles.map((role) => ({
    roleId: role.id,
    value: `${role.title} [${role.year} ${RoleTypeToLabelMap[role.type]}]`,
  }));
  const roleOptionsWithAdd: RoleAutocompleteOption[] = [...roleOptions, { roleId: null, value: 'Add new role' }];

  const onSelectRole = (value: string, { roleId }: RoleAutocompleteOption) => {
    if (roleId === null) {
      setIsCreateRoleFormOpen(true);
    }

    setSelectedRoleId(roleId);
  };

  const onSearchRole = (inputValue: string) => {
    setRoleSearchParams((prevState) => ({ ...prevState, searchWords: splitByWhitespaces(inputValue) }));
  };

  return (
    <>
      <CreateCompanyForm
        isOpen={isCreateCompanyFormOpen}
        closeForm={() => setIsCreateCompanyFormOpen(false)}
        onCreate={onCreateCompany}
      />

      <CreateRoleForm
        company={selectedCompany}
        isOpen={isCreateRoleFormOpen}
        closeForm={() => setIsCreateRoleFormOpen(false)}
        onCreate={(createdRole: RoleData) => setSelectedRoleId(createdRole.id)}
      />

      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} className="p-8">
        <Form.Item label={'Company'}>
          <Select
            showSearch
            options={companyOptionsWithAdd}
            onSelect={onSelectCompany}
            onSearch={onSearchCompany}
            filterOption={false} // Options are already filtered by the API, and we want to show the "Add new company" option
            value={companyOptions.find((option) => option.company === selectedCompany)?.value}
            loading={!companiesData}
          />
        </Form.Item>
        <Form.Item label={'Role'}>
          <Select
            showSearch
            options={roleOptionsWithAdd}
            onSelect={onSelectRole}
            onSearch={onSearchRole}
            filterOption={false} // Options are already filtered by the API, and we want to show the "Add new role" option
            value={roleOptions.find((option) => option.roleId === selectedRoleId)?.value}
            loading={!rolesData}
          />
        </Form.Item>
        <Form.Item label={'Date Applied'}>
          <DatePicker />
        </Form.Item>
      </Form>
    </>
  );
}

export default ApplicationCreate;
