import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export default {
    data: {
        name: 'commands',
        description: 'Displays all available commands and their details',
    },
    load: true,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const commandDetails = this.getCommandDetails(interaction);
            let currentPage = 0;
            const itemsPerPage = 25;
            const pageCount = Math.ceil(commandDetails.length / itemsPerPage);

            const generateEmbed = this.generateEmbedFunction(commandDetails, itemsPerPage, pageCount);
            const buttons = this.generateButtons(currentPage, pageCount);

            await interaction.editReply({ embeds: [generateEmbed(currentPage)], components: [buttons] });

            const collector = this.createCollector(interaction, currentPage, pageCount);
            this.handleCollectorEvents(collector, currentPage, pageCount, generateEmbed, buttons);

        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error while displaying the commands.');
        }
    },

    getCommandDetails(interaction) {
        return Array.from(interaction.client.commands.values()).map(command => ({
            name: command.data.name,
            description: command.data.description,
        }));
    },

    generateEmbedFunction(commandDetails, itemsPerPage, pageCount) {
        return (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const currentCommands = commandDetails.slice(start, end);

            const embed = new EmbedBuilder()
                .setTitle('Available Commands')
                .setColor('#0099ff');

            currentCommands.forEach(detail => {
                embed.addFields({ name: detail.name, value: detail.description || 'No description available', inline: true });
            });
            embed.setFooter({ text: `Page ${page + 1} of ${pageCount}` });

            return embed;
        };
    },

    generateButtons(currentPage, pageCount) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === pageCount - 1)
            );
    },

    createCollector(interaction, currentPage, pageCount) {
        const filter = (i) => ['previous', 'next'].includes(i.customId) && i.user.id === interaction.user.id;
        return interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
    },

    handleCollectorEvents(collector, currentPage, pageCount, generateEmbed, buttons) {
        collector.on('collect', async (i) => {
            if (i.customId === 'previous' && currentPage > 0) {
                currentPage--;
            } else if (i.customId === 'next' && currentPage < pageCount - 1) {
                currentPage++;
            }

            buttons.components[0].setDisabled(currentPage === 0);
            buttons.components[1].setDisabled(currentPage === pageCount - 1);

            await i.update({ embeds: [generateEmbed(currentPage)], components: [buttons] });
        });
    }
};