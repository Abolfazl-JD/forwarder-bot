# 📢 Telegram Forwarder Bot

A lightweight Node.js + TypeScript Telegram bot that automatically forwards messages from an admin to all Telegram groups the bot is a member of.  
Built using the [Telegraf](https://github.com/telegraf/telegraf) framework.

---

## 🚀 Features

- Add the bot to multiple Telegram groups.
- When an **admin** sends a message to the bot (in private), it forwards that message to **all groups** where the bot is a member.
- Supports text, photos, and other message types (depending on configuration).
- Simple and fast — no database required.
- Works perfectly on Ubuntu with PM2 for process management.

---

## 🧩 Tech Stack

- **Node.js** (v18+ recommended)
- **TypeScript**
- **Telegraf** (Telegram Bot API library)
- **PM2** (for production process management)
