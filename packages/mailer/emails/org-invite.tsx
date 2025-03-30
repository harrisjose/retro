import crypto from "crypto";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import config from "../src/config.js";
import type { InviteEmailProps } from "../src/types.js";

const staticUrl = config.assets.staticUrl;

const getGravatarUrl = (email: string) => {
  const hashedEmail = crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");

  return `https://gravatar.com/avatar/${hashedEmail}?s=64&d=mp`;
};

export const InviteEmail = ({
  userName,
  userEmail,
  userImage,
  invitedByUsername,
  invitedByEmail,
  orgName,
  orgImage = `${staticUrl}/mail/mellow-team.png`,
  inviteLink,
}: InviteEmailProps) => {
  const previewText = `Join ${invitedByUsername} on Mellow`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${staticUrl}/mail/mellow-balloon.png`}
                width="40"
                height="40"
                alt="Mellow"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Join <strong>{orgName}</strong> on <strong>Mellow</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {userName ?? userEmail?.split("@")[0]},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{invitedByUsername}</strong> (
              <Link
                href={`mailto:${invitedByEmail}`}
                className="text-blue-600 no-underline"
              >
                {invitedByEmail}
              </Link>
              ) has invited you to the <strong>{orgName}</strong> team on{" "}
              <strong>Mellow</strong>.
            </Text>
            <Section>
              <Row>
                <Column align="right">
                  <Img
                    className="rounded-full"
                    src={userImage ?? getGravatarUrl(userEmail)}
                    referrerPolicy="no-referrer"
                    width="64"
                    height="64"
                  />
                </Column>
                <Column align="center">
                  <Img
                    src={`${staticUrl}/mail/mail-arrow.png`}
                    width="12"
                    height="9"
                    alt="invited you to"
                  />
                </Column>
                <Column align="left">
                  <Img
                    className="rounded-full"
                    src={orgImage ?? `${staticUrl}/mail/mellow-team.png`}
                    width="64"
                    height="64"
                  />
                </Column>
              </Row>
            </Section>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                Join the team
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you were not expecting this invitation, you can ignore this
              email. If you are concerned about your account's safety, please
              reach out to{" "}
              <a href="mailto:support@mellow.team">support@mellow.team</a>.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

InviteEmail.PreviewProps = {
  userName: "Pradeep",
  userEmail: "prade6@gmail.com",
  userImage: `https://lh3.googleusercontent.com/a/ACg8ocKG62Jt4Xgu8MB4fPxp1hI-oZf_OM7WCW_Slhl9YQvTsMn600o=s96-c`,
  invitedByUsername: "Harris",
  invitedByEmail: "harris@mellow.team",
  orgName: "AkiFlow",
  inviteLink: `${config.app.url}/accept-invitation/ejy-123`,
} as InviteEmailProps;

export default InviteEmail;
