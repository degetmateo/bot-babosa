import fetch from "node-fetch";
import * as toHex from "colornames";

import { Client, ClientEvents, Message, EmbedBuilder, ColorResolvable } from "discord.js";

import { Obra } from "./Obra";
import { Usuario } from "./Usuario";
import { DB } from "./Database";
import { AniUser } from "../models/AniUser";

import { Mensaje } from "./Mensaje";

import { Media } from "../modulos/Media";
import { Usuarios } from "../modulos/Usuarios";
import { Afinidad } from "../modulos/Afinidad";
import { Setup } from "../modulos/Setup";

class BOT {
    private client: Client;
    private db: DB;

    constructor(client: Client, db: DB) {
        this.client = client;
        this.db = db;
    }

    public async iniciar() {
        this.on("ready", () => console.log("BOT preparado!"));


        this.on("messageCreate", async (message: Message) => {
            if (!message) return;
            if (message.author.bot) return;
            if (!message.guild) return;

            const mensaje = new Mensaje(message);
            const comando = mensaje.getComando();
            const args = mensaje.getArgumentos();
        
            if (comando === "Hola") {
                message.reply(`${message.client.emojis.cache.find((e => e.name === "pala"))}`);
            };
        
            if (comando == "!anime") {
                const anime = await this.anime(args.join(" "));

                if (!anime) {
                    return message.react("❌");
                } else {
                    message.react("✅");
                }

                const embedInformacion = await this.EmbedInformacionMedia(message, anime, false);
                this.enviarEmbed(message, embedInformacion);
            }

            if (comando == "!animeb") {
                const anime = await this.anime(args.join(" "));

                if (!anime) {
                    return message.react("❌");
                } else {
                    message.react("✅");
                }

                const embedInformacion = await this.EmbedInformacionMedia(message, anime, true);
                this.enviarEmbed(message, embedInformacion);
            }
        
            if (comando == "!manga") {
                const manga = await this.manga(args.join(" "));
                
                if (!manga) {
                    return message.react("❌");
                } else {
                    message.react("✅");
                }

                const embedInformacion = await this.EmbedInformacionMedia(message, manga, false);
                this.enviarEmbed(message, embedInformacion);
            }
        
            if (comando == "!mangab") {
                const manga = await this.manga(args.join(" "));
                
                if (!manga) {
                    return message.react("❌");
                } else {
                    message.react("✅");
                }

                const embedInformacion = await this.EmbedInformacionMedia(message, manga, true);
                this.enviarEmbed(message, embedInformacion);
            }

            if (comando == "!user") {
                let usuario;

                if (!args[0] || args[0].length <= 0) {
                    usuario = await this.usuario(message.guild.id, message.author.id);
                } else {
                    const usuarioMencionado = message.mentions.members?.first();
                    
                    if (usuarioMencionado) {
                        usuario = await this.usuario(message.guild.id, usuarioMencionado.id);
                    } else {
                        usuario = await this.usuario(message.guild.id, args[0]);
                    }
                }
                
                if (!usuario) {
                    return message.react("❌");
                } else {
                    message.react("✅");
                }
        
                const embedInformacion = await this.EmbedInformacionUsuario(usuario);
                this.enviarEmbed(message, embedInformacion);
            }
        
            if (comando == "!setup") {
                const result = await this.setup(args[0], message);
        
                if (result) {
                    message.react("✅");
                } else {
                    message.react("❌");
                }
            }
        
            if (comando == "!unsetup") {
                const result = await this.unsetup(message);
        
                if (result) {
                    message.react("✅");
                } else {
                    message.react("❌");
                }
            }
        
            if (comando == "!afinidad") {
                let resultado: boolean;

                const serverID = message.guildId == null ? "" : message.guildId;

                if (!args[0]) {
                    resultado = await this.afinidad(message, message.author.id, serverID);
                } else {
                    if (message.mentions.members?.first()) {
                        const uMencionado = message.mentions.members.first();
                        const userID = uMencionado == null ? "" : uMencionado.id;

                        resultado = await this.afinidad(message, userID, serverID);
                    } else {
                        const username = args[0];
                        const user = await AniUser.findOne({ anilistUsername: username });
                        const userID = user?.discordId == undefined ? "" : user?.discordId;

                        resultado = user == undefined ? false : await this.afinidad(message, userID, serverID);
                    }
                }
        
                if (resultado) {
                    message.react("✅");
                } else {
                    message.react("❌");
                }
            }

            if (comando == "!help") {
                const descripcion = "▹ `!setup [anilist username]` - Guardar tu usuario de anilist para mostrar tus notas.\n▹ `!unsetup` - Elimina tu usuario de anilist.\n▹ `!user | [anilist username] | [discord mention]` - Ver la información del perfil de anilist de un usuario.\n▹ `!afinidad | [anilist username] | [discord mention]` - Muestra tu afinidad o la otro usuario con el resto del servidor.\n▹ `!manga o !anime [nombre] | [id]` - Muestra la información de un anime o manga.\n▹ `!mangab o !animeb [nombre] | [id]` - Lo mismo pero con la descripción traducida.";
                
                const EmbedInformacion = new EmbedBuilder()
                    .setTitle("▾ Comandos")
                    .setDescription(descripcion.trim());

                this.enviarEmbed(message, EmbedInformacion);
            }
        
            if (message.content.endsWith("13") || message.content.endsWith("trece")) {
                this.responder(message, "¿Dijiste 13? Aquí tiene pa' que me la bese, entre más me la beses más me crece, busca un cura pa' que me la rese, y trae un martillo pa' que me la endereces, por el chiquito se te aparece toas las veces y cuando te estreses aquí te tengo éste pa' que te desestreses, con este tallo el jopo se te esflorece, se cumple el ciclo hasta que anochece, to' los días y toas las veces, de tanto entablar la raja del jopo se te desaparece, porque este sable no se compadece, si pides ñapa se te ofrece, y si repites se te agradece, no te hace rico pero tampoco te empobrece, no te hace inteligente pero tampoco te embrutece, y no paro aquí compa que éste nuevamente se endurece, hasta que amanece, cambie esa cara que parece que se entristece, si te haces viejo éste te rejuvenece, no te hago bulla porque depronto te ensordece, y ese cuadro no te favorece, pero tranquilo que éste te abastece, porque allá abajo se te humedece, viendo como el que me cuelga resplandece, si a ti te da miedo a mí me enorgullece, y así toas las vece ¿que te parece?, y tranquilo mijo que aquí éste reaparece, no haga fuerza porque éste se sobrecrece, una fresadora te traigo pa' que me la freses, así se fortalece y de nuevo la historia se establece, que no se te nuble la vista porque éste te la aclarece, y sino le entendiste nuevamente la explicación se te ofrece, pa' que por el chiquito éste de nuevo te empiece... Aquí tienes para que me la beses, entre más me la beses más me crece, busca un cura para que me la rece, un martillo para que me la endereces, un chef para que me la aderece, 8000 mondas por el culo se te aparecen, si me la sobas haces que se me espese, si quieres la escaneas y te la llevas para que en tu hoja de vida la anexes, me culeo a tu maldita madre y qué te parece le meti la monda a tú mamá hace 9 meses y después la puse a escuchar René de Calle 13 Te la meto por debajo del agua como los peces, y aquella flor de monda que en tu culo crece, reposa sobre tus nalgas a veces y una vez más...");
            };
        
            if (message.content.endsWith("12") || message.content.endsWith("doce")) {
                this.responder(message, "las de doce son goood");
            };
        
            if (message.content.endsWith("5") || message.content.endsWith("cinco")) {
                this.responder(message, "por el culo te la hinco");
            }
        
            if (message.content.endsWith("contexto")) {
                this.responder(message, "Espera dijiste contexto? Te la tragas sin pretexto, así no estés dispuesto, pero tal vez alguna vez te lo has propuesto, y te seré honesto te haré el favor y te lo presto, tan fuerte que tal vez me den arresto, ya no aguantas ni el sexto, así que lo dejamos pospuesto, pero te falta afecto y te lo dejo otra vez puesto, te aplastó en la pared como insecto tan duro que sale polvo de asbesto, llamo al arquitecto Alberto y al modesto Ernesto, y terminas más abierto que portón de asentamiento, ya no tenes más almacenamiento así que necesitas asesoramiento y a tu madre llamamos para darle su afecto así hasta el agotamiento y al siguiente día repetimos y así terminó y te la meto sin pretexto, así no estés dispuesto, pero tal vez alguna vez te lo has propuesto, y te seré honesto te haré el favor y te lo presto, tan fuerte que tal vez me den arresto, ya no aguantas ni el sexto, así que lo dejamos pospuesto, pero te falta afecto y te lo dejo otra vez puesto, te aplastó en la pared como insecto tan duro que sale polvo de asbesto, llamo al arquitecto Alberto y al modesto Ernesto, y terminas más abierto que portón de asentamiento, ya no tenes más almacenamiento así que necesitas asesoramiento y a tu madre llamamos para darle su afecto así hasta el agotamiento y al siguiente día repetimos pero ya estás descompuesto así que para mí continuar sería incorrecto y me voy sin mostrar algún gesto, dispuesto a seguir apenas y ya estés compuesto voy y te doy el impuesto pero no sin antes avisarte que este es el contexto 👍.");
            }
        });
        
        this.db.conectar(process.env.DB);
        this.client.login(process.env.TOKEN);
    }

    private on(event: keyof ClientEvents, func: any) {
        this.client.on(event, func);
    }

    private responder(message: Message, text: string) {
        message.reply(text);
    }

    private enviar(message: Message, text: string) {
        message.channel.send(text);
    }

    private enviarEmbed(message: Message, embed: EmbedBuilder) {
        message.channel.send({ embeds: [embed] });
    }

    private async EmbedInformacionMedia(message: Message, obra: Obra, traducir: boolean): Promise<EmbedBuilder> {
        const titulos = obra.getTitulos();

        const EmbedInformacion = new EmbedBuilder()
            .setTitle(titulos.romaji == null ? titulos.native : titulos.romaji)
            .setURL(obra.getURL())
            .setDescription(traducir == true ? await obra.getDescripcionTraducida() : obra.getDescripcion())
            .setThumbnail(obra.getCoverImageURL())
            .setFooter({ text: obra.getTitulos().native + " | " + obra.getTitulos().english });

        if (obra.getTipo() == "ANIME") {
            const infoTEXT_1 = `
                ‣ **Tipo**: ${obra.getTipo()}\n‣ **Formato**: ${obra.getFormato()}\n‣ **Estado**: ${obra.getEstado()}\n‣ **Calificación**: ${obra.getPromedio()}/100
            `;

            const infoTEXT_2 = `
                ‣ **Popularidad**: ${obra.getPopularidad()}\n‣ **Favoritos**: ${obra.getFavoritos()}\n‣ **Temporada**: ${obra.getTemporada()}\n‣ **Año de Emisión**: ${obra.getAnioEmision()}\n‣ **Episodios**: ${obra.getEpisodios()}
            `;

            EmbedInformacion
                .setColor(0xff0000)
                .addFields(
                    { name: "▽", value: infoTEXT_1, inline: true },
                    { name: "▽", value: infoTEXT_2, inline: true }
                )
        } else {
            const infoTEXT_1 = `
                ‣ **Tipo**: ${obra.getTipo()}\n‣ **Formato**: ${obra.getFormato()}\n‣ **Estado**: ${obra.getEstado()}\n‣ **Calificación**: ${obra.getPromedio()}/100
            `;

            const infoTEXT_2 = `
                ‣ **Popularidad**: ${obra.getPopularidad()}\n‣ **Favoritos**: ${obra.getFavoritos()}\n‣ **Capítulos**: ${obra.getCapitulos()}\n‣ **Volúmenes**: ${obra.getVolumenes()}
            `;

            EmbedInformacion
                .setColor(0xFFFF00)
                .addFields(
                    { name: "▽", value: infoTEXT_1, inline: true },
                    { name: "▽", value: infoTEXT_2, inline: true }
                )
        }

        let estudiosInfo = "";

        const estudios = obra.getEstudios();

        for (let i = 0; i < estudios.length; i++) {
            estudiosInfo += "`" + estudios[i].name + "` - ";
        }

        estudiosInfo = estudiosInfo.substring(0, estudiosInfo.length - 3);

        if (!estudiosInfo || estudiosInfo.length < 0) estudiosInfo = "`Desconocidos`";

        if (obra.getTipo() == "ANIME") {
            EmbedInformacion
                .addFields(
                    { name: "▿ Estudios", value: estudiosInfo, inline: false }
                )
        }

        let generosInfo = "";

        const generos = obra.getGeneros();

        for (let i = 0; i < generos.length; i++) {
            generosInfo += "`" + generos[i] + "` - "
        }

        generosInfo = generosInfo.substring(0, generosInfo.length - 3);

        if (!generosInfo || generosInfo.length < 0) generosInfo = "`Desconocidos`"

        EmbedInformacion
            .addFields(
                { name: "▿ Géneros", value: generosInfo, inline: false }
            );


        const uMedia = await this.getUsuariosMedia(message.guild?.id, obra);

        if (uMedia.length > 0) {
            let completedTEXT = "";
            let inProgressTEXT = "";
            let droppedTEXT = "";
            let pausedListTEXT = "";
            let planningTEXT = "";

            for (let i = 0; i < uMedia.length; i++) {
                if (uMedia[i].status == "COMPLETED") {
                    completedTEXT += `${uMedia[i].name} **[${uMedia[i].score}]** - `;
                }

                if (uMedia[i].status == "DROPPED") {
                    droppedTEXT += `${uMedia[i].name} **(${uMedia[i].progress})** **[${uMedia[i].score}]** - `;
                }

                if (uMedia[i].status == "CURRENT") {
                    inProgressTEXT += `${uMedia[i].name} **(${uMedia[i].progress})** **[${uMedia[i].score}]** - `;
                }

                if (uMedia[i].status == "PAUSED") {
                    pausedListTEXT += `${uMedia[i].name} **[${uMedia[i].score}]** - `;
                }

                if (uMedia[i].status == "PLANNING") {
                    planningTEXT += `${uMedia[i].name} - `;
                }
            }

            if (completedTEXT.trim().endsWith("-")) {
                completedTEXT = completedTEXT.substring(0, completedTEXT.length - 2);
            }

            if (droppedTEXT.trim().endsWith("-")) {
                droppedTEXT = droppedTEXT.substring(0, droppedTEXT.length - 2);
            }

            if (inProgressTEXT.trim().endsWith("-")) {
                inProgressTEXT = inProgressTEXT.substring(0, inProgressTEXT.length - 2);
            }

            if (pausedListTEXT.trim().endsWith("-")) {
                pausedListTEXT = pausedListTEXT.substring(0, pausedListTEXT.length - 2);
            }

            if (planningTEXT.trim().endsWith("-")) {
                planningTEXT = planningTEXT.substring(0, planningTEXT.length - 2);
            }

            if (completedTEXT.trim() == "") {
                completedTEXT = "Nadie"
            }

            if (droppedTEXT.trim() == "") {
                droppedTEXT = "Nadie"
            }

            if (inProgressTEXT.trim() == "") {
                inProgressTEXT = "Nadie"
            }

            if (pausedListTEXT.trim() == "") {
                pausedListTEXT = "Nadie"
            }

            if (planningTEXT.trim() == "") {
                planningTEXT = "Nadie"
            }

            EmbedInformacion
                .addFields(
                    { name: "▿ Completado por", value: completedTEXT, inline: false },
                    { name: "▿ Dropeado por", value: droppedTEXT, inline: false },
                    { name: "▿ Pausado por", value: pausedListTEXT, inline: false },
                    { name: "▿ Iniciado por", value: inProgressTEXT, inline: false },
                    { name: "▿ Planeado por", value: planningTEXT, inline: false }
                )
        }

        return EmbedInformacion;
    }

    private async anime(args: string) {
        return await this.buscarMedia("ANIME", args);
    }

    private async manga(args: string) {
        return await this.buscarMedia("MANGA", args);
    }

    private async buscarMedia(tipo: string, args: string) {
        if (isNaN(+args) || isNaN(parseFloat(args))) {
            const media = await Media.BuscarMedia(this, tipo, args);
            return media == null ? null : new Obra(media);
        } else {
            const media = await Media.BuscarMediaID(this, tipo, args);
            return media == null ? null : new Obra(media);
        }
    }

    private async getUsuariosMedia(serverID: any, media: Obra) {
        return await Usuarios.GetUsuariosMedia(this, serverID, media);
    }

    public async request(query: string, variables: any): Promise<any> {
        const url = 'https://graphql.anilist.co';
    
        const opciones = {
            method: 'POST',
            
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },

            body: JSON.stringify({ query, variables })
        };

        const data = await fetch(url, opciones);
        const response = await data.json();

        if (!response || !response.data) return null;

        return response.data;
    }

    public async buscarMediaUsuario(userID: string | undefined, mediaID: string) {
        return await Usuarios.GetStatsMedia(this, userID, mediaID);
    }

    public async buscarListaUsuario(username: string) {
        return await Usuarios.GetEntradas(this, username);
    }

    public async usuario(serverID: string, args: string): Promise<Usuario | null> {
        const user = await Usuarios.BuscarUsuario(this, serverID, args);
        return user == null ? null : new Usuario(user);
    }

    private async EmbedInformacionUsuario(usuario: any) {
        const hexColor = toHex.get(usuario.getColorName()).value;
        const color = "0x" + hexColor;

        const stats = usuario.getEstadisticas();

        const EmbedInformacion = new EmbedBuilder()
            .setTitle(usuario.getNombre())
            .setURL(usuario.getURL())
            .setColor(color as ColorResolvable)
            .setThumbnail(usuario.getAvatarURL())
            .setImage(usuario.getBannerImage())
            .setDescription(usuario.getBio())
            .addFields(
                { 
                    name: "Animes",
                    value: `‣ Vistos: ${stats.anime.count}\n‣ Nota Promedio: ${stats.anime.meanScore}\n‣ Días Vistos: ${((stats.anime.minutesWatched / 60) / 24).toFixed()}\n‣ Episodios Totales: ${stats.anime.episodesWatched}`,
                    inline: false
                },
                { 
                    name: "Mangas",
                    value: `‣ Leídos: ${stats.manga.count}\n‣ Nota Promedio: ${stats.manga.meanScore}\n‣ Capítulos Leídos: ${stats.manga.chaptersRead}\n‣ Volúmenes Leídos: ${stats.manga.volumesRead}`,
                    inline: false
                },
            )

        return EmbedInformacion;
    }

    private async setup(username: string, message: Message): Promise<boolean> {
        return await Setup.SetupUsuario(this, username, message);
    }

    private async unsetup(message: Message): Promise<boolean> {
        return await Setup.UnsetupUsuario(this, message);
    }

    private async afinidad(message: Message, userID: string, serverID: string): Promise<boolean> {
        const uRegistrados = await AniUser.find({ serverId: serverID });
        const usuario = uRegistrados.find(u => u.discordId == userID);

        if (!usuario) return false;

        message.channel.sendTyping();

        const aniuser1 = await this.usuario(message.guildId == null ? "" : message.guildId, usuario?.anilistUsername || "");

        if (!aniuser1) return false;

        let afinidades = await Afinidad.GetAfinidadUsuario(this, aniuser1, uRegistrados);
        let textoAfinidad = "";

        for (let i = 0; i < afinidades.length && i < 10; i++) {
            textoAfinidad += `▹ ${afinidades[i].username} - **${afinidades[i].afinidad}%**\n`;
        }

        const hexColor = toHex.get(aniuser1 == null ? "black" : aniuser1.getColorName()).value;
        const color = "0x" + hexColor;

        const EmbedAfinidad = new EmbedBuilder()
            .setTitle("Afinidad de " + aniuser1.getNombre())
            .setThumbnail(aniuser1.getAvatarURL())
            .setDescription(textoAfinidad)
            .setColor(color as ColorResolvable)

        this.enviarEmbed(message, EmbedAfinidad);

        return true;
    }
}

export { BOT };