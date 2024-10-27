require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const fs = require('fs');
const path = require('path');

// Đọc dữ liệu từ file games.json
const gamesPath = path.join(__dirname, '..', 'database', 'games.json');
const games = JSON.parse(fs.readFileSync(gamesPath));

// Tạo client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Đăng ký lệnh slash
const commands = [
    {
        name: "list",
        description: "List all games",
    },
    {
        name: "search",
        description: "Search for a game by name",
        options: [
            {
                name: "name",
                type: 3, // ApplicationCommandOptionType.String
                description: "Name of the game to search for",
                required: true,
            },
        ],
    },
];

// Đăng ký lệnh lên Discord
const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            {
                body: commands,
            }
        );

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();

// Xử lý các tương tác lệnh
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === "list") {
        const gameNames = games.map((game) => game.NAME).join("\n");
        await interaction.reply(`**Games List:**\n${gameNames}`);
    } else if (commandName === "search") {
        const gameName = interaction.options.getString("name");
        const foundGame = games.find(
            (game) => game.NAME.toLowerCase() === gameName.toLowerCase()
        );

        if (foundGame) {
            await interaction.reply(
                `**Found Game:** ${foundGame.NAME}\n**Description:** ${foundGame.DESCRIPTION}\n**Store Page:** ${foundGame["STORE PAGE"]}`
            );
        } else {
            await interaction.reply(
                `No game found with the name: **${gameName}**`
            );
        }
    }
});

// Đăng nhập vào bot
client.login("");
