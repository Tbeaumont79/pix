import { OrganizationForAdmin } from '../../../../lib/domain/models/organizations-administration/OrganizationForAdmin.js';

function buildOrganizationForAdmin({
  id = 123,
  name = 'Lycée Luke Skywalker',
  type = 'SCO',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  externalId = 'OrganizationIdLinksToExternalSource',
  provinceCode = '2A',
  isManagingStudents = false,
  code = null,
  credit = 500,
  email = 'jesuistonpere@example.net',
  createdAt = new Date('2018-01-12T01:02:03Z'),
  targetProfileShares = [],
  tags = [],
  createdBy,
  documentationUrl = 'https://pix.fr',
  showNPS = false,
  formNPSUrl = 'https://pix.fr',
  showSkills = false,
  archivedAt = null,
  archivistFirstName = null,
  archivistLastName = null,
  dataProtectionOfficerFirstName = null,
  dataProtectionOfficerLastName = null,
  dataProtectionOfficerEmail = null,
  identityProviderForCampaigns = null,
  features = {},
  parentOrganizationId = null,
  parentOrganizationName = null,
} = {}) {
  return new OrganizationForAdmin({
    id,
    name,
    type,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    code,
    credit,
    email,
    createdAt,
    targetProfileShares,
    tags,
    createdBy,
    documentationUrl,
    showNPS,
    formNPSUrl,
    showSkills,
    archivedAt,
    archivistFirstName,
    archivistLastName,
    dataProtectionOfficerFirstName,
    dataProtectionOfficerLastName,
    dataProtectionOfficerEmail,
    identityProviderForCampaigns,
    features,
    parentOrganizationId,
    parentOrganizationName,
  });
}

export { buildOrganizationForAdmin };
