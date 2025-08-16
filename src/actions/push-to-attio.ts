import { Contact } from "@/types";
import { NextResponse } from "next/server";

export async function pushToAttio(companies: Contact[]) {
  const ATTI0_API_URL = "https://api.attio.com/v2/objects/companies/records";
  const ATTI0_API_KEY = process.env.ATTIO_API_KEY!;

  console.log("attio api key", ATTI0_API_KEY);

  try {
    const results = await Promise.all(
      companies.map(async (company) => {
        const payload = {
          data: {
            values: {
              domains: company.domain ? [{ domain: company.domain }] : [],
              name: [{ value: company.name }],
              description: [], // optional
              twitter: company.twitter ? [{ value: company.twitter }] : [],
              primary_location: [],
              categories: [],
            },
          },
        };

        try {
          const res = await fetch(ATTI0_API_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ATTI0_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const error = await res.text();
            console.error(`Failed to push company ${company.name}:`, error);
            return { success: false, company, error };
          }

          const data = await res.json();
          return { success: true, company, data };
        } catch (err) {
          console.error(`Error pushing company ${company.name}:`, err);
          return { success: false, company, error: err };
        }
      })
    );

    return NextResponse.json({
      success: true,
      pushedCount: results.filter((r) => r.success).length,
      failedCount: results.filter((r) => !r.success).length,
      results,
    });
  } catch (err) {
    console.error("Error in pushToAttio:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected error pushing to Attio" },
      { status: 500 }
    );
  }
}
