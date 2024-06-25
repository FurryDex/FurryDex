const { Client, Collection, Partials, Status, REST, Routes, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.GuildScheduledEvent, Partials.ThreadMember],
});
const Logger = require("./utils/Logger");
const debug = true;

const { GiveawaysManager } = require("discord-giveaways");
const { isXMinutesPassed } = require("./utils/functions/spawn");
const config = require("./config");
const manager = new GiveawaysManager(client, {
  storage: "./giveaways.json",
  default: {
    botsCanWin: false,
    embedColor: "#00BDFF",
    embedColorEnd: "#01004D",
    reaction: "🎉",
  },
});

client.giveawaysManager = manager;
let date = new Date();

let nothing = {};

fs.writeFile(`./BackUp/BU-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`, JSON.stringify(nothing), (err) => {
  if (err) {
    Logger.error(err);
  }
});

//#
//#  ["temp", "ticket", "users"].forEach((x) => {
//#  let info = require(`./DB/${x}.json`);
//#  let backUp = require(`./BackUp/BU-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`);
//#  backUp[x] = info;
//#  fs.writeFile(`./BackUp/BU-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`, JSON.stringify(backUp), (err) => {
//#    if (err) {
//#      Logger.error(err);
//#    }
//#  });
//#});

["commands", "buttons", "selects", "modals", "blacklist_guild"].forEach((x) => (client[x] = new Collection()));
["CommandUtil", "EventUtil", "ButtonUtil", "ModalUtil", "SelectMenuUtil"].forEach((handler) => {
  require(`./utils/handlers/${handler}`)(client);
});
//

//require("./api/index.js");

if (!debug) {
  process.on("exit", (code) => {
    Logger.error(`Bot stopped with code: ${code}`);
  });
  process.on("uncaughtException", (err, origin) => {
    Logger.error(`${"uncaughtException".toUpperCase()}: ${err}\nOrigin: ${origin}`);
  });
  process.on("unhandledRejection", (reason, promise) => {
    Logger.error(`${"unhandledRejection".toUpperCase()}: ${reason}\n${promise}`);
  });
  process.on("warning", (...args) => Logger.warn(...args));
}

client.login(process.env.DISCORD_TOKEN);

// --------- COG & SPAWN ----------

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  isXMinutesPassed(message, client);
});

// ---------- Command sender ----------

// and deploy your commands!

module.exports = { client };
