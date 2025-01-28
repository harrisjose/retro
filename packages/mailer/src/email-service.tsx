import { render } from "@react-email/render";
import { SendMailClient } from "zeptomail";
import InviteEmail from "../emails/org-invite.js";
import config from "./config.js";
import type { InviteEmailProps } from "./types.js";

type EmailService = {
  sendInvitation(data: InviteEmailProps): Promise<void>;
};

class ZeptoService implements EmailService {
  private client: SendMailClient;

  constructor() {
    this.client = new SendMailClient({
      url: config.zepto.url,
      token: config.zepto.token,
    });
  }

  async sendInvitation(data: InviteEmailProps): Promise<void> {
    try {
      const html = await render(<InviteEmail {...data} />);
      const plainText = await render(<InviteEmail {...data} />, {
        plainText: true,
      });

      await this.client.sendMail({
        from: {
          address: "noreply@tm.mellow.team",
          name: "Mellow",
        },
        to: [
          {
            email_address: {
              address: data.userEmail,
            },
          },
        ],
        subject: `You've been invited to join ${data.orgName} on Mellow`,
        htmlbody: html,
        textbody: plainText,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }

    console.debug(`User ${data.userEmail} invited to ${data.orgName}.`);
  }
}

const emailService = new ZeptoService();

export { emailService, type EmailService };
