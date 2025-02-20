import type { HttpBindings } from "@hono/node-server";
import { WebClient } from "@slack/web-api";
import { type Context, Hono } from "hono";
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
  const payload = JSON.parse(formData.get("payload") as string) as SlackPayload;
  console.log("payload", payload);

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
