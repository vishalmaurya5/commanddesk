import { NextResponse } from "next/server";

export async function GET() {
  try {
    const channels = [
      { id: "ch-1", name: "general", unread: 2, type: "channel" },
      { id: "ch-2", name: "announcements", unread: 0, type: "channel" },
      { id: "ch-3", name: "engineering", unread: 5, type: "channel" },
      { id: "ch-4", name: "design-feedback", unread: 0, type: "channel" },
    ];

    const directMessages = [
      { id: "dm-1", name: "Sarah Chen", avatar: "", status: "online", unread: 1 },
      { id: "dm-2", name: "Marcus Vance", avatar: "", status: "offline", unread: 0 },
      { id: "dm-3", name: "Elena Rostova", avatar: "", status: "online", unread: 0 },
    ];

    const messages = [
      {
        id: "m-1",
        sender: "Sarah Chen",
        avatar: "",
        time: "10:14 AM",
        text: "Hey team! The brand refresh designs for CommandDesk V2 have been uploaded to Figma. Take a look when you get a chance!",
      },
      {
        id: "m-2",
        sender: "Alex Rivera",
        avatar: "",
        time: "10:18 AM",
        text: "Awesome work Sarah! Looking forward to reviewing the sidebar dark mode components.",
      },
      {
        id: "m-3",
        sender: "Marcus Vance",
        avatar: "",
        time: "10:25 AM",
        text: "Deployment pipeline for staging is updated. All unit tests passing cleanly 🚀",
      },
    ];

    return NextResponse.json({ channels, directMessages, messages });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
