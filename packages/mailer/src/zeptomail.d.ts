// Generated using Claude based on examples from https://www.npmjs.com/package/zeptomail
declare module "zeptomail" {
  interface EmailAddress {
    address: string;
    name: string;
  }

  interface EmailRecipient {
    email_address: {
      address: string;
      name?: string;
    };
  }

  interface Attachment {
    content?: string;
    mime_type?: string;
    name: string;
    file_cache_key?: string;
  }

  interface InlineImage {
    mime_type?: string;
    content?: string;
    cid: string;
    file_cache_key?: string;
  }

  interface SendMailOptions {
    from: EmailAddress;
    to: EmailRecipient[];
    reply_to?: EmailAddress[];
    subject: string;
    textbody?: string;
    htmlbody?: string;
    cc?: EmailRecipient[];
    bcc?: EmailRecipient[];
    track_clicks?: boolean;
    track_opens?: boolean;
    client_reference?: string;
    mime_headers?: Record<string, string>;
    attachments?: Attachment[];
    inline_images?: InlineImage[];
  }

  export class SendMailClient {
    constructor(config: { url: string; token: string });
    sendMail(data: SendMailOptions): Promise<any>;
  }
}
