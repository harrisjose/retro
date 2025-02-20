import type { HttpBindings } from "@hono/node-server";
import { WebClient } from "@slack/web-api";
import { Hono } from "hono";
import { getInitialYDoc } from "../collab/utils.js";
import { db } from "../db/index.js";

// Create a new Hono instance for Slack routes
const slack = new Hono<{ Bindings: HttpBindings }>();

interface SlackPayload {
  team_id: string;
  channel_id: string;
  user_id: string;
  message: { ts: string };
  type?: string;
  actions?: Array<{ action_id: string }>;
  text?: string;
}

type ProcessRequestResult = Awaited<ReturnType<typeof processRequest>>;

// Helper function to validate Slack request and get integration
async function processRequest(formData: FormData) {
  console.log("formdata", formData, formData.entries());
  const payload = Object.fromEntries(
    formData.entries(),
  ) as unknown as SlackPayload;
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
  await slackClient.chat.update({
    channel: payload.channel_id,
    text: "Create a retrospective",
    ts: payload.message.ts,
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
    if (!payload.text) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

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
      channel: payload.channel_id,
      text: `✅ Document *${document.name}* created by <@${payload.user_id}>`,
    });

    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }
}

slack.post("/interactions", async (c) => {
  console.log("c req", c);
  const formData = await c.req.formData();
  console.log("c req", c);
  const { slackClient, payload, integration } = await processRequest(formData);

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
  } else {
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
  }

  return new Response(null, { status: 200 });
});

export default slack;
