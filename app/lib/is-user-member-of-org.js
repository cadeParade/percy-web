import AdminMode from 'percy-web/lib/admin-mode';

export default function isUserMember(currentUser, org) {
  if (!currentUser || !org) return false;
  const isUserMemberOfOrg = !!orgUserForOrg(currentUser, org);
  const isUserAdminMode = AdminMode.isAdmin();
  return isUserMemberOfOrg || isUserAdminMode;
}

export function orgUserForOrg(user, organization) {
  if (!user || !organization) return false;
  return user.organizationUsers.findBy('organization.id', organization.id);
}

export function isUserAdminOfOrg(user, organization) {
  const orgUser = orgUserForOrg(user, organization);
  if (!orgUser) return false;

  return orgUser.role === 'admin';
}
