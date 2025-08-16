import { pushToAttio } from "@/actions/push-to-attio";
import { attioClient } from "@/lib/integrations/attioClient";
import { Contact } from "@/types";
import { type NextRequest, NextResponse } from "next/server";

interface PushRequest {
  integration: string;
  contacts: Contact[];
  config: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const { integration, contacts, config }: PushRequest = await request.json();

    if (!integration || !contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Route to appropriate integration handler
    switch (integration) {
      case "attio":
        return await pushToAttio(contacts);
      case "notion":
        return await pushToNotion(contacts, config);
      case "airtable":
        return await pushToAirtable(contacts, config);
      case "webhook":
        return await pushToWebhook(contacts, config);
      default:
        return NextResponse.json(
          { error: "Unsupported integration" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Integration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function pushToNotion(contacts: Contact[], config: any) {
  // Mock Notion integration
  // In a real implementation, you would use Notion's API
  console.log("Pushing to Notion:", { contacts: contacts.length, config });

  // Example of how you might structure the Notion API call:
  /*
  const notion = new Client({ auth: config.token })
  
  for (const contact of contacts) {
    await notion.pages.create({
      parent: { database_id: config.databaseId },
      properties: {
        Name: { title: [{ text: { content: contact.name } }] },
        Email: { email: contact.email },
        Phone: { phone_number: contact.phone },
        Organization: { rich_text: [{ text: { content: contact.organization } }] }
      }
    })
  }
  */

  await new Promise((resolve) => setTimeout(resolve, 1500));

  return NextResponse.json({
    success: true,
    message: `Successfully pushed ${contacts.length} contacts to Notion database`,
    pushedCount: contacts.length,
  });
}

async function pushToAirtable(contacts: Contact[], config: any) {
  // Mock Airtable integration
  console.log("Pushing to Airtable:", { contacts: contacts.length, config });

  await new Promise((resolve) => setTimeout(resolve, 1200));

  return NextResponse.json({
    success: true,
    message: `Successfully pushed ${contacts.length} contacts to Airtable base`,
    pushedCount: contacts.length,
  });
}

async function pushToWebhook(contacts: Contact[], config: any) {
  // Generic webhook integration
  try {
    const response = await fetch(config.url, {
      method: config.method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...JSON.parse(config.headers || "{}"),
      },
      body: JSON.stringify({ contacts }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sent ${contacts.length} contacts to webhook`,
      pushedCount: contacts.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Webhook failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 400 }
    );
  }
}
