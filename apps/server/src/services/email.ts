type EmailService = {
  sendInvitation(data: {
    email: string;
    invitedByUsername: string;
    invitedByEmail: string;
    teamName: string;
    inviteLink: string;
  }): Promise<void>;
};

class LocalEmailService implements EmailService {
  async sendInvitation(data: {
    email: string;
    invitedByUsername: string;
    invitedByEmail: string;
    teamName: string;
    inviteLink: string;
  }): Promise<void> {
    console.debug(
      `User ${data.email} invited to ${data.teamName}. Use link ${data.inviteLink} to accept the invitation.`,
    );
  }
}

const emailService = new LocalEmailService();

export { emailService, type EmailService };
