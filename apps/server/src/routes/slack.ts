import { WebClient } from "@slack/web-api";
import { type Context, Hono } from "hono";
import { getInitialYDoc } from "../collab/utils.js";
import { db } from "../db/index.js";
import config from "../lib/config.js";

const slack = new Hono();

// const SLACK_REDIRECT_URI = `https://bbb2-121-200-54-151.ngrok-free.app/api/slack/oauth/callback`;
// const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!;

slack.get("/oauth", async (c) => {
  try {
    const organizationId = c.req.query("organization_id");
    const userId = c.req.query("user_id");

    if (!organizationId || !userId) {
      throw new Error("organization_id and user_id are required");
    }

    const member = await db
      .selectFrom("member")
      .selectAll()
      .where("member.organizationId", "=", organizationId)
      .where("member.userId", "=", userId)
      .executeTakeFirst();

    if (!member) {
      throw new Error(
        "The user is not a member of the organization to setup this integration",
      );
    }

    // Store the organization_id & user_id in state (encoded)
    const state = Buffer.from(
      JSON.stringify({
        organization_id: organizationId,
        user_id: userId,
      }),
    ).toString("base64");

    const scopes = [
      "channels:read",
      "chat:write",
      "chat:write.public",
      "commands",
    ];
    const scopeParam = scopes.join(",");
    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${scopeParam}&user_scope=&redirect_uri=${encodeURIComponent(SLACK_REDIRECT_URI)}&state=${state}`;

    return c.redirect(authUrl);
  } catch (error) {
    console.error("Slack OAuth Error:", error);
    return c.redirect(
      `${config.app.url}/error?code=SLACK_INTEGRATION_SETUP_ERROR`,
    );
  }
});

// 🔹 2️⃣ Step 2: Handle OAuth Callback
slack.get("/oauth/callback", async (c) => {
  try {
    const code = c.req.query("code");
    const state = c.req.query("state");

    if (!code || !state) {
      throw new Error("Missing authorization code or state");
    }

    // Decode state to get organization_id and user_id
    const decodedState = JSON.parse(Buffer.from(state, "base64").toString());
    const { organization_id, user_id } = decodedState;

    const existingIntegration = await db
      .selectFrom("integration")
      .where("organizationId", "=", organization_id)
      .where("integration", "=", "slack")
      .executeTakeFirst();

    if (existingIntegration) {
      throw new Error("Slack integration already exists for this organization");
    }

    const response = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.integrations.slack.clientId,
        client_secret: config.integrations.slack.clientSecret,
        code,
        redirect_uri: `${config.app.url}/${config.integrations.slack.redirectUri}`,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error);
    }

    const bot_token = data.access_token;
    const team_id = data.team.id;
    const team_name = data.team.name;

    const existingTeamIntegration = await db
      .selectFrom("integration")
      .where("teamId", "=", team_id)
      .where("integration", "=", "slack")
      .executeTakeFirst();

    if (existingTeamIntegration) {
      throw new Error(
        "Slack workspace is already connected to another organization",
      );
    }

    await db
      .insertInto("integration")
      .values({
        organizationId: organization_id,
        integration: "slack",
        teamId: team_id,
        teamName: team_name,
        botToken: bot_token,
        createdBy: user_id,
      })
      .execute();

    return c.redirect(`${config.app.url}/dashboard`);
  } catch (error) {
    console.error("Slack OAuth Callback Error:", error);
    return c.redirect(
      `${config.app.url}/error?code=SLACK_INTEGRATION_SETUP_ERROR`,
    );
  }
});

interface SlackPayload {
  type: string;

  command: string;
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  };
  container: {
    type: string;
    message_ts: string;
    channel_id: string;
    is_ephemeral: boolean;
  };
  team: {
    id: string;
    domain: string;
  };
  channel: { id: string; name: string };
  state?: {
    values: Record<string, any>;
  };
  response_url: string;
  actions?: Array<{
    action_id: string;
    block_id: string;
    text: any;
    style: string;
    type: string;
    action_ts: string;
  }>;
}

type ProcessRequestResult = Awaited<ReturnType<typeof processRequest>>;
function getFormattedDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function sendSlackResponse(responseUrl: string, blocks: any[]) {
  await fetch(responseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      response_type: "ephemeral",
      blocks,
    }),
  });
}

slack.post("/command", async (c) => {
  const formData = await c.req.formData();

  const payload = Object.fromEntries(formData.entries()) as unknown as {
    team_id: string;
    channel_id: string;
    user_id: string;
    response_url: string;
  };

  const { team_id, channel_id, user_id, response_url } = payload;

  if (!team_id || !channel_id || !user_id || !response_url) {
    throw new Error("Missing required fields");
  }

  const integration = await db
    .selectFrom("integration")
    .selectAll()
    .where("integration.teamId", "=", team_id)
    .executeTakeFirst();

  if (!integration || !integration.botToken) {
    throw new Error("Slack bot not installed for this organization");
  }

  await sendSlackResponse(response_url, [
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Create Retro" },
          action_id: "create_retro_button",
          style: "primary",
        },
      ],
    },
  ]);

  return new Response(null, { status: 200 });
});

// Helper function to validate Slack request and get integration
async function processRequest(c: Context) {
  const formData = await c.req.formData();
  const timestamp = c.req.header("X-Slack-Request-Timestamp");
  const slackSignature = c.req.header("X-Slack-Signature");
  if (!timestamp || !slackSignature) {
    throw new Error("Missing Slack signature or timestamp");
  }

  const currentTime = Math.floor(Date.now() / 1000);

  if (Math.abs(currentTime - Number(timestamp)) > 60 * 5) {
    console.error("⏳ Request timestamp too old, possible replay attack!");
    throw new Error("Request is too old");
  }

  const payload = JSON.parse(formData.get("payload") as string) as SlackPayload;

  // TODO - add the signature check
  // const basestring = `v0:${timestamp}:${await c.req.text()}`;
  // const hmac = createHmac("sha256", SLACK_SIGNING_SECRET)
  //   .update(basestring)
  //   .digest("hex");
  // const expectedSignature = `v0=${hmac}`;

  // // Compare signatures securely
  // if (
  //   !timingSafeEqual(
  //     Buffer.from(expectedSignature),
  //     Buffer.from(slackSignature),
  //   )
  // ) {
  //   throw new Error("Invalid signature");
  // }

  const team_id = payload.team?.id;
  const channel_id = payload.channel?.id;
  const user_id = payload.user?.id;

  if (!team_id || !channel_id || !user_id) {
    throw new Error("Missing required fields");
  }

  const integration = await db
    .selectFrom("integration")
    .selectAll()
    .where("integration.teamId", "=", team_id)
    .executeTakeFirst();

  if (!integration || !integration.botToken) {
    throw new Error("Slack bot not installed for this organization");
  }

  return {
    integration,
    payload,
  };
}

async function handleCreateRetroForm({ payload }: ProcessRequestResult) {
  await sendSlackResponse(payload.response_url, [
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "Provide the following details to create a retro 🌟",
        emoji: true,
      },
    },
    {
      type: "input",
      block_id: "name",
      label: {
        type: "plain_text",
        text: "Name",
      },
      element: {
        type: "plain_text_input",
        action_id: "name_input",
        placeholder: {
          type: "plain_text",
          text: "Enter retro name",
        },
      },
    },
    {
      type: "input",
      block_id: "start_date",
      label: {
        type: "plain_text",
        text: "Start Date",
      },
      element: {
        type: "datepicker",
        action_id: "start_date_input",
        initial_date: getFormattedDate(new Date()),
      },
    },
    {
      type: "input",
      block_id: "end_date",
      label: {
        type: "plain_text",
        text: "End Date",
      },
      element: {
        type: "datepicker",
        action_id: "end_date_input",
        initial_date: getFormattedDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ),
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Submit",
          },
          action_id: "submit_retro",
          style: "primary",
        },
      ],
    },
  ]);

  return new Response(null, { status: 200 });
}

async function handleCreateRetroSubmit({
  payload,
  integration,
}: ProcessRequestResult) {
  try {
    const slackClient = new WebClient(integration.botToken);

    const name = payload.state?.values?.name?.name_input?.value?.trim();
    const startDate =
      payload.state?.values?.start_date?.start_date_input?.selected_date ??
      new Date();
    const endDate =
      payload.state?.values?.end_date?.end_date_input?.selected_date ??
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    let errorMessage = "";
    if (!name) errorMessage += "❌ Retro name is required.\n";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errorMessage += "❌ End date must be after the start date.\n";
    }

    // 🔹 If errors exist, send a new message
    if (errorMessage) {
      await slackClient.chat.postEphemeral({
        channel: payload.channel.id,
        user: payload.user.id,
        text: `⚠️ *Error:*\n${errorMessage}`,
      });
      return new Response(null, { status: 200 });
    }

    const document = await db
      .insertInto("document")
      .values({
        name,
        organizationId: integration.organizationId,
        createdBy: integration.createdBy,
        yDoc: getInitialYDoc(),
        yDocUpdatedAt: new Date(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    await sendSlackResponse(payload.response_url, [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: `✅ Retro document *${document.name}* created successfully`,
        },
      },
    ]);
    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }
}

slack.post("/interactions", async (c) => {
  const { integration, payload } = await processRequest(c);

  if (
    payload.type === "block_actions" &&
    payload.actions?.[0]?.action_id === "create_retro_button"
  ) {
    await handleCreateRetroForm({
      payload,
      integration,
    });
  } else if (
    payload.type === "block_actions" &&
    payload.actions?.[0]?.action_id === "submit_retro"
  ) {
    await handleCreateRetroSubmit({
      payload,
      integration,
    });
  }

  return new Response(null, { status: 200 });
});

export default slack;
