const config = require('../../config');
const Logger = require('../../utils/Logger');
const { REST, Routes } = require('discord.js');
const { clientId, token } = require('../../config.json');
const fs = require('fs');

let activity = 'count my card ...';

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		Logger.client(client, 'Je suis prêt !');

		client.application.commands.set(client.commands.map((cmd) => cmd));

		client.user.setPresence({
			activities: [{ name: activity }],
		});

		if (client.user.id == config.bot.Stable) {
			let guild = await client.guilds.cache.get('1235970684556021890');
			let channel = await guild.channels.cache.get('1236239805973663846');
			//const response = await fetch(`http://192.168.1.10:10002/info.json`, {
			//	method: 'GET',
			//});

			// Retrieve the access_token from the response
			//const { version } = await response.json();
			channel.setTopic(`Actual Stable Version: V${require('../../package.json').version}, Actual Canary Version: V${require('../../package.json').version}`);
		}

		//const response = await fetch(`http://192.168.1.10:10002/info.json`, {
		//	method: 'GET',
		//});

		//console.log(response);

		client
			.knex('guilds')
			.update({ last_card: null })
			.catch((err) => console.error(err));

		Logger.succes(client, 'Bot démaré avec succès !');
	},
};
