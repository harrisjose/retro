import {
  adminAc,
  createAccessControl,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/access";

// These are the default roles from better-auth. Once we have
// permissions for documents, we can add them to these statements.
// Refer to https://www.notion.so/itsprade/Workspaces-Pricing-4950c7aa6a104109943ea0a5aa0e30be

const statement = {
  ...defaultStatements,
  document: [],
} as const;

const ac = createAccessControl(statement);

const owner = ac.newRole({
  document: [],
  ...ownerAc.statements,
});

const admin = ac.newRole({
  document: [],
  ...adminAc.statements,
});

const member = ac.newRole({
  document: [],
  ...memberAc.statements,
});

export { ac, admin, member, owner };
