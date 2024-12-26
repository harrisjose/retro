import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  document: ["read", "create", "share", "update", "delete"],
  organization: ["invite", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

const owner = ac.newRole({
  document: ["read", "create", "share", "update", "delete"],
  organization: ["invite", "update", "delete"],
});

const member = ac.newRole({
  document: ["read", "create", "share", "update", "delete"],
  organization: ["invite", "update"],
});

const guest = ac.newRole({
  document: ["read"],
});

export { ac, guest, member, owner };
