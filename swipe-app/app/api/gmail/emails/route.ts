import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

interface GmailMessage {
    id: string;
    threadId: string;
}

interface GmailMessageDetails {
    id: string;
    payload: {
        headers: Array<{ name: string; value: string }>;
        body?: { data?: string };
        parts?: Array<{ body?: { data?: string }; mimeType?: string }>;
    };
    snippet: string;
    internalDate: string;
    labelIds: string[];
    sizeEstimate: number;
}

export async function GET(request: Request) {
    const session = await getServerSession();

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const maxResults = searchParams.get("maxResults") || "20";
    const pageToken = searchParams.get("pageToken") || "";

    try {
        // Fetch list of messages
        const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=category:promotions OR category:social OR is:unread${pageToken ? `&pageToken=${pageToken}` : ""}`;

        const listResponse = await fetch(listUrl, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!listResponse.ok) {
            const error = await listResponse.json();
            return NextResponse.json({ error: error.error?.message || "Failed to fetch emails" }, { status: listResponse.status });
        }

        const listData = await listResponse.json();
        const messages: GmailMessage[] = listData.messages || [];

        // Fetch details for each message (batch up to 10)
        const emailDetails = await Promise.all(
            messages.slice(0, 10).map(async (msg) => {
                const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=List-Unsubscribe`;

                const detailResponse = await fetch(detailUrl, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });

                if (!detailResponse.ok) return null;

                const detail: GmailMessageDetails = await detailResponse.json();

                const getHeader = (name: string) =>
                    detail.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";

                const fromHeader = getHeader("From");
                const senderMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || [null, fromHeader, fromHeader];

                return {
                    id: detail.id,
                    provider: "gmail",
                    providerId: detail.id,
                    sender: senderMatch[2] || fromHeader,
                    senderName: senderMatch[1]?.replace(/"/g, "") || fromHeader,
                    senderDomain: (senderMatch[2] || fromHeader).split("@")[1] || "",
                    subject: getHeader("Subject"),
                    preview: detail.snippet,
                    receivedAt: new Date(parseInt(detail.internalDate)).toISOString(),
                    timestamp: parseInt(detail.internalDate),
                    listUnsubscribe: {
                        http: getHeader("List-Unsubscribe").match(/<(https?:\/\/[^>]+)>/)?.[1] || null,
                        mailto: getHeader("List-Unsubscribe").match(/<(mailto:[^>]+)>/)?.[1] || null,
                    },
                    category: detail.labelIds.includes("CATEGORY_PROMOTIONS") ? "promo" :
                        detail.labelIds.includes("CATEGORY_SOCIAL") ? "social" : "newsletter",
                    labels: detail.labelIds,
                    isRead: !detail.labelIds.includes("UNREAD"),
                    size: detail.sizeEstimate,
                    metadata: {},
                    headers: {},
                };
            })
        );

        return NextResponse.json({
            emails: emailDetails.filter(Boolean),
            nextPageToken: listData.nextPageToken,
            resultSizeEstimate: listData.resultSizeEstimate,
        });

    } catch (error) {
        console.error("Gmail API error:", error);
        return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
    }
}
