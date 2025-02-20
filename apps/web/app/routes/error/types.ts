export const ErrorCodesMap = {
  // error codes from better auth invitation flow
  INVITATION_NOT_FOUND: {
    title: "The invitation has been expired or deleted.",
    description:
      "Please contact the administrator and ask them to send you a new invitation.",
  },
  YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION: {
    title: "You are not the recipient of this invitation.",
    description:
      "You might be logged in with a different account. Please logout and login with the account associated with this invitation and try again.",
  },
  ORGANIZATION_NOT_FOUND: {
    title: "The organization has been deleted.",
    description: "Please contact the administrator.",
  },
  INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION: {
    title: "The inviter is no longer a member of the organization.",
    description:
      "Please contact the administrator and ask them to send you a new invitation.",
  },
} as const;
