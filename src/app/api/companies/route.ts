// app/api/attio/companies/route.ts (Next.js App Router)
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.attio.com/v2/objects/companies/records/query",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sorts: [
            {
              direction: "asc",
              attribute: "domains",
              field: "domain",
            },
          ],
          limit: 500,
          offset: 0,
        }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
