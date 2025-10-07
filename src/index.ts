import "dotenv/config";
import { Telegraf } from "telegraf";
import { addGroup, removeGroup, getGroups } from "./groupStore";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN is not set in .env");
  process.exit(1);
}

const ADMIN_IDS = (process.env.ADMIN_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => Number(s));

const bot = new Telegraf(token);

const userState = new Map<number, "AWAITING_BROADCAST">();

function isAdmin(id?: number | null) {
  if (!id) return false;
  return ADMIN_IDS.includes(id);
}

// Add/remove groups when bot is added/removed
bot.on("my_chat_member", async (ctx) => {
  try {
    const chat = ctx.myChatMember?.chat;
    const newStatus = ctx.myChatMember?.new_chat_member?.status;
    if (!chat || !newStatus) return;
    const chatId = chat.id;

    if (newStatus === "member" || newStatus === "administrator") {
      addGroup(chatId);
    } else if (newStatus === "left" || newStatus === "kicked") {
      removeGroup(chatId);
    }
  } catch (e) {
    console.error(new Date().toString(), "Error handling my_chat_member", e);
  }
});

bot.start((ctx) => {
  ctx.reply(
    "Broadcast bot ready. Admins: use /broadcast to send a message to all groups this bot is in.",
  );
});

// List groups (admin only)
bot.command("listgroups", async (ctx) => {
  const from = ctx.from?.id;
  if (!isAdmin(from)) return ctx.reply("admin only");
  const groups = getGroups();
  await ctx.reply(`Tracked groups: ${groups.length}`);
});

// Cancel
bot.command("cancel", async (ctx) => {
  const id = ctx.from?.id;
  if (!id) return;
  userState.delete(id);
  await ctx.reply("Cancelled.");
});

// /broadcast command: either inline or triggers a waiting state
bot.command("broadcast", async (ctx) => {
  const from = ctx.from?.id;
  if (!isAdmin(from)) return ctx.reply("admin only");

  userState.set(from!, "AWAITING_BROADCAST");
  await ctx.reply(
    "Send the message you want to broadcast. Use /cancel to abort.",
  );
});

bot.on("message", async (ctx) => {
  try {
    const from = ctx.from?.id;
    if (!from) return;

    // If the user is awaiting broadcast and sends a text, broadcast it
    if (userState.get(from) === "AWAITING_BROADCAST") {
      if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("Please send a text message to broadcast.");
        return;
      }

      const text = ctx.message.text;
      await ctx.reply("Broadcasting your message to tracked groups...");
      await doBroadcast(text, ctx);
      userState.delete(from);
      return;
    }

    // otherwise ignore non-command messages
  } catch (e) {
    console.error(new Date().toString(), "Error in message handler", e);
  }
});

async function doBroadcast(text: string, ctx: any) {
  const groups = getGroups();
  if (groups.length === 0) {
    await ctx.reply(
      "No groups tracked. Add the bot to groups to enable broadcasting.",
    );
    return;
  }

  let success = 0;
  let failed = 0;

  for (const chatIdStr of groups) {
    const chatId = chatIdStr; // stored as string
    try {
      await bot.telegram.sendMessage(chatId, text).catch((e) => {
        throw e;
      });
      success++;
    } catch (e) {
      failed++;
      console.error("Error occurred:", JSON.stringify(e, null, 2));
    }
  }

  await ctx.reply(
    `Broadcast completed. Success: ${success}, Failed: ${failed}`,
  );
}

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.launch().then(() => {
  console.log(new Date().toString(), "Bot launched");
});
