export interface InviteEmailProps {
  userEmail: string;
  userName?: string;
  userImage?: string;
  invitedByUsername: string;
  invitedByEmail: string;
  orgName: string;
  orgImage?: string;
  inviteLink: string;
}
