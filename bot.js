const { Client, Collection, Partials, Status, REST, Routes, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv');
const process = require('node:process');
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
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution,
		GatewayIntentBits.DirectMessagePolls,
		GatewayIntentBits.GuildMessagePolls,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildVoiceStates,
	],
	partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.GuildScheduledEvent, Partials.ThreadMember],
});
const Logger = require('./utils/Logger');
const debug = true;

//require('./api/server');

const { GiveawaysManager } = require('discord-giveaways');
const { isXMinutesPassed, win } = require('./utils/functions/spawn');
const mysql = require('mysql');
const config = require('./config');
const manager = new GiveawaysManager(client, {
	storage: './giveaways.json',
	default: {
		botsCanWin: false,
		embedColor: '#00BDFF',
		embedColorEnd: '#01004D',
		reaction: '🎉',
	},
});

client.giveawaysManager = manager;

client.locales = {};

function locales() {
	try {
		fetch('http://192.168.1.10:10004/get/', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
		})
			.then(async (response) => {
				loc = await response.json();
				client.locales = loc;
				fs.writeFileSync('./locales.json', JSON.stringify(client.locales));
			})
			.catch((err) => {
				logger.error(client, 'Locales', err);
				client.locales = fs.readFileSync('./locales.json');
			});
	} catch (err) {
		Logger.error(null, 'Cannot get translation', err);
	}
}

locales();
while (client.locales != {} && client.locales.isReady.yes.en_US != 'ready') {
	setTimeout(() => {
		let hop = 'hop';
	}, 1000);
}
console.log(client.locales);

[('commands', 'buttons', 'selects', 'modals', 'blacklist_guild')].forEach((x) => (client[x] = new Collection()));
['CommandUtil', 'EventUtil', 'ButtonUtil', 'ModalUtil', 'SelectMenuUtil'].forEach((handler) => {
	require(`./utils/handlers/${handler}`)(client);
});
//

//require("./api/index.js");

if (!debug) {
	process.on('exit', (code) => {
		Logger.error(client, `Bot stopped with code: ${code}`);
	});
	process.on('uncaughtException', (err, origin) => {
		Logger.error(client, `${'uncaughtException'.toUpperCase()}: ${err}\nOrigin: ${String(origin)}`);
	});
	process.on('unhandledRejection', (reason, promise) => {
		Logger.error(client, `${'unhandledRejection'.toUpperCase()}: ${reason}\n${String(promise)}`);
	});
	process.on('warning', (...args) => Logger.warn(...args));
	client.rest.on('rateLimited', (rateLimited) => {
		Logger.warn(client, `${'rateLimited'.toUpperCase()}: ${rateLimited}`);
	});
	client.rest.on('invalidRequestWarning', (invalidRequestWarningData) => {
		Logger.warn(client, `${'invalidRequestWarning'.toUpperCase()}: ${invalidRequestWarningData}`);
	});
	client.on('warn', (info) => {
		Logger.warn(client, `${'warn'.toUpperCase()}: ${info}`);
	});
	client.on('error', (info) => {
		Logger.error(client, `${'error'.toUpperCase()}: ${info}`);
	});
	client.on('shardDisconnect', (event, id) => {
		Logger.shard(client, `${'shardDisconnect'.toUpperCase()} - ID: ${id}: ${event}`);
	});
	client.on('shardError', (event, id) => {
		Logger.error(client, `${'shardError'.toUpperCase()} - ID: ${id}: ${event}`);
	});
	client.on('shardReady', (event, id) => {
		Logger.shard(client, `${'shardReady'.toUpperCase()} - ID: ${id}: ${event}`);
	});
	client.on('shardReconnecting', (id) => {
		Logger.shard(client, `${'shardReconnecting'.toUpperCase()} - ID: ${id}`);
	});
	client.on('shardResume', (id, event) => {
		Logger.shard(client, `${'shardResume'.toUpperCase()} - ID: ${id}: ${event}`);
	});
}

const winston = require('winston');
const { setTimeout } = require('node:timers/promises');
const { stringify } = require('node:querystring');

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	defaultMeta: { service: 'user-service' },
	transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'error.log', level: 'error' }), new winston.transports.File({ filename: 'all.log' })],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
logger.add(
	new winston.transports.Console({
		format: winston.format.simple(),
	})
);

client.knex = require('knex')(require('./config.json').connection);

client.data = client.knex;

client.login(require('./config.json').token);

// --------- COG & SPAWN ----------

client.on('messageCreate', (message) => {
	if (client.user.id == config.bot.Canary) {
		if (message.guild.members.cache.get(config.bot.Stable)) return;
	}
	if (message.author.bot) return;
	isXMinutesPassed(message, client);
});

let callAmount = 0;
process.on('SIGINT', function () {
	if (callAmount < 1) {
		Logger.succes(client, '✅ - Desactivation du bot ...', 'Veuillez patientez');
		setTimeout(() => process.exit(0), 1000);
	}

	callAmount++;
});

module.exports = { client };
