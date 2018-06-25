const _ = require('lodash');

class User {

  constructor({
    id,
    // attributes
    cgu,
    email,
    firstName,
    lastName,
    password,
    // includes
    organizationsAccesses = [],
    pixRoles = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = _.toLower(email);
    this.password = password;
    this.cgu = cgu;
    // includes
    this.pixRoles = pixRoles;
    this.organizationsAccesses = organizationsAccesses;
    // references
  }

  get hasRolePixMaster() {
    return !!this.pixRoles.find(pixRole => pixRole.name === 'PIX_MASTER');
  }

  isLinkedToOrganizations() {
    return this.organizationsAccesses.length > 0;
  }

  hasAccessToOrganization(organizationId) {
    if(this.isLinkedToOrganizations()) {
      return this.organizationsAccesses
        .map((organizationAccess) => organizationAccess.organization.id)
        .includes(organizationId);
    }
    return false;
  }

}

module.exports = User;
