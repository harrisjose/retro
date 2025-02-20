import type { HttpBindings } from "@hono/node-server";
import { WebClient } from "@slack/web-api";
import { Hono } from "hono";
import { getInitialYDoc } from "../collab/utils.js";
import { db } from "../db/index.js";

// Create a new Hono instance for Slack routes
const slack = new Hono<{ Bindings: HttpBindings }>();

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

slack.post("/command", async (c) => {
  const formData = await c.req.formData();
  const timestamp = c.req.header("X-Slack-Request-Timestamp");
  const payload = Object.fromEntries(formData.entries()) as unknown as {
    team_id: string;
    channel_id: string;
    user_id: string;
  };

  console.log("payload", payload, timestamp);
  const { team_id, channel_id, user_id } = payload;

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

  const slackClient = new WebClient(integration.botToken);

  await slackClient.chat.postEphemeral({
    channel: payload.channel_id,
    user: payload.user_id,
    blocks: [
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
    ],
  });
  return new Response(null, { status: 200 });
});

// Helper function to validate Slack request and get integration
async function processRequest(formData: FormData) {
  const payload = JSON.parse(formData.get("payload") as string) as SlackPayload;
  console.log("form data", payload);

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
    slackClient: new WebClient(integration.botToken),
    payload,
  };
}

async function handleCreateRetroForm({
  slackClient,
  payload,
}: ProcessRequestResult) {
  await slackClient.chat.postEphemeral({
    channel: payload.channel!.id || "",
    user: payload.user!.id || "",
    text: "Create a retrospective",
    blocks: [
      {
        type: "input",
        block_id: "retro_name",
        label: { type: "plain_text", text: "Retro Name" },
        element: {
          type: "plain_text_input",
          action_id: "retro_name_input",
        },
      },
      {
        type: "input",
        block_id: "start_date",
        label: { type: "plain_text", text: "Start Date" },
        element: { type: "datepicker", action_id: "start_date_picker" },
      },
      {
        type: "input",
        block_id: "end_date",
        label: { type: "plain_text", text: "End Date" },
        element: { type: "datepicker", action_id: "end_date_picker" },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Submit" },
            action_id: "submit_retro",
            style: "primary",
          },
        ],
      },
    ],
  });

  return new Response(null, { status: 200 });
}

async function handleCreateRetroSubmit({
  slackClient,
  payload,
  integration,
}: ProcessRequestResult) {
  try {
    const retroName = payload.text.match(/name=['"]([^'"]+)['"]/);

    if (!retroName) {
      return new Response(
        JSON.stringify({
          error: "Invalid format. Use: name='Sample Document'",
        }),
        { status: 400 },
      );
    }

    const name = retroName[1];

    const document = await db
      .insertInto("document")
      .values({
        name: name,
        organizationId: integration.organizationId,
        createdBy: integration.createdBy,
        yDoc: getInitialYDoc(),
        yDocUpdatedAt: new Date(),
        startDate: new Date(),
        endDate: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Respond in Slack using the correct organization's bot token
    await slackClient.chat.postMessage({
      channel: payload.channel?.id || "",
      text: `✅ Document *${document.name}* created by <@${payload.user?.id}>`,
    });

    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }
}

slack.post("/interactions", async (c) => {
  const formData = await c.req.formData();
  console.log("form data", formData, c.req.json(), c.req);
  const { slackClient, integration, payload } = await processRequest(formData);
  console.log("payload", payload);

  if (
    payload.type &&
    payload.type === "block_actions" &&
    payload.actions?.[0]?.action_id === "create_retro_button"
  ) {
    await handleCreateRetroForm({
      slackClient,
      payload,
      integration,
    });
  }

  return new Response(null, { status: 200 });
});

export default slack;
