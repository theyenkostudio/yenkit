import { type NextRequest, NextResponse } from "next/server";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch webpage" },
        { status: 400 }
      );
    }

    const html = await response.text();
    const contacts = extractContactsFromHTML(html, url);

    return NextResponse.json({ contacts, url });
  } catch (error) {
    console.error("Error extracting contacts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function extractContactsFromHTML(html: string, sourceUrl: string) {
  // Remove scripts, styles, svg, and comments
  const cleanedHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Extract emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const emails = Array.from(new Set(cleanedHtml.match(emailRegex) || []));

  // Extract phones from tel: links (must start with +)
  const telLinkRegex = /href=["']tel:(\+\d[\d\s-]*)["']/gi;
  const telMatches: string[] = [];
  let telMatch;
  while ((telMatch = telLinkRegex.exec(cleanedHtml)) !== null) {
    telMatches.push(telMatch[1].trim());
  }

  // Extract visible phone numbers (must start with +)
  const phoneRegex = /\+[\d][\d\s\-()]{6,}/g;
  const textPhones = (cleanedHtml.match(phoneRegex) || []).map((p) =>
    p.replace(/\s+/g, " ").trim()
  );

  // Merge and dedupe phones
  const phones = Array.from(new Set([...telMatches, ...textPhones]));

  // Extract Twitter links
  const twitterRegex = /https?:\/\/(?:www\.)?twitter\.com\/[A-Za-z0-9_]+/gi;
  const twitterLinks = Array.from(
    new Set(cleanedHtml.match(twitterRegex) || [])
  );

  // Extract LinkedIn links
  const linkedInRegex =
    /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|company)\/[A-Za-z0-9\-_%]+/gi;
  const linkedInLinks = Array.from(
    new Set(cleanedHtml.match(linkedInRegex) || [])
  );

  // Get domain and organization
  const domain = new URL(sourceUrl).hostname.replace(/^www\./, "");
  const titleMatch = cleanedHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
  const organization = titleMatch?.[1]?.trim() || domain.split(".")[0];

  return {
    emails,
    phones,
    twitter: twitterLinks,
    linkedIn: linkedInLinks,
    organization,
    domain,
  };
}
