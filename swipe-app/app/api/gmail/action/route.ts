import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
    const session = await getServerSession();

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { emailId, action } = await request.json();

    if (!emailId || !action) {
        return NextResponse.json({ error: "Missing emailId or action" }, { status: 400 });
    }

    try {
        let result;

        switch (action) {
            case "delete":
                // Move to trash
                result = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/trash`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                );
                break;

            case "keep":
                // Mark as read and archive
                result = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            removeLabelIds: ["UNREAD", "INBOX"],
                        }),
                    }
                );
                break;

            case "unsubscribe":
                // Mark as read, we'll let the UI handle actual unsubscribe redirect
                result = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            removeLabelIds: ["UNREAD"],
                            addLabelIds: ["TRASH"],
                        }),
                    }
                );
                break;

            case "block":
                // Create a filter to auto-delete future emails from this sender
                // For now, just trash it
                result = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/trash`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                );
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        if (!result.ok) {
            const error = await result.json();
            return NextResponse.json({ error: error.error?.message || "Action failed" }, { status: result.status });
        }

        return NextResponse.json({ success: true, action, emailId });

    } catch (error) {
        console.error("Gmail action error:", error);
        return NextResponse.json({ error: "Action failed" }, { status: 500 });
    }
}
