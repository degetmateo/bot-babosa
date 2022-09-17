"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const discord_js_1 = require("discord.js");
const toHex = __importStar(require("colornames"));
const Obra_1 = require("./Obra");
const Usuario_1 = require("./Usuario");
const AniUser_1 = require("../models/AniUser");
const db_1 = require("../db");
class BOT {
    constructor(client) {
        this.client = client;
    }
    on(event, func) {
        this.client.on(event, func);
    }
    responder(message, text) {
        message.reply(text);
    }
    enviar(message, text) {
        message.channel.send(text);
    }
    enviarEmbed(message, embed) {
        message.channel.send({ embeds: [embed] });
    }
    enviarInfoMedia(message, obra) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const EmbedInformacion = new discord_js_1.EmbedBuilder()
                .setTitle(obra.getTitulos().native)
                .setURL(obra.getURL())
                // .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
                .setDescription(obra.getDescripcion())
                .setThumbnail(obra.getCoverImageURL())
                // .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
                // .setImage('https://i.imgur.com/AfFp7pu.png')
                // .setTimestamp()
                .setFooter({ text: obra.getTitulos().romaji + " | " + obra.getTitulos().english });
            if (obra.getTipo() == "ANIME") {
                EmbedInformacion
                    .setColor(0xff0000)
                    .addFields({ name: "Tipo", value: obra.getTipo(), inline: true }, { name: "Formato", value: obra.getFormato(), inline: true }, { name: "Estado", value: obra.getEstado(), inline: true }, { name: "Calificación", value: obra.getPromedio() + "/100", inline: true }, { name: "Popularidad", value: obra.getPopularidad(), inline: true }, { name: "Favoritos", value: obra.getFavoritos(), inline: true }, { name: "Temporada", value: obra.getTemporada(), inline: true }, { name: "Episodios", value: obra.getEpisodios(), inline: true }, { name: "Duracion", value: obra.getDuracion(), inline: true });
            }
            else {
                EmbedInformacion
                    .setColor(0xFFFF00)
                    .addFields({ name: "Tipo", value: obra.getTipo(), inline: true }, { name: "Formato", value: obra.getFormato(), inline: true }, { name: "Estado", value: obra.getEstado(), inline: true }, { name: "Calificación", value: obra.getPromedio() + "/100", inline: true }, { name: "Popularidad", value: obra.getPopularidad(), inline: true }, { name: "Favoritos", value: obra.getFavoritos(), inline: true }, { name: "Temporada", value: obra.getTemporada(), inline: true }, { name: "Capítulos", value: obra.getCapitulos(), inline: true }, { name: "Volúmenes", value: obra.getVolumenes(), inline: true });
            }
            const users = yield db_1.DB.buscar((_a = message.guild) === null || _a === void 0 ? void 0 : _a.id.toString());
            const usuariosObra = [];
            // for (let i = 0; i < users.length; i++) {
            // }
            yield this.buscarLista(users[0].anilistId, obra.getID());
            this.enviarEmbed(message, EmbedInformacion);
        });
    }
    buscarLista(userID, mediaID) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = parseInt(userID);
            const mediaId = parseInt(mediaID);
            const query = `
            query ($id: Int, $mediaId: Int) {
                MediaList(userId: $id, mediaId: $mediaId) {
                    id
                    media {
                        id
                    }
                }
            }`;
            const variables = {
                id: id,
                mediaId: mediaID
            };
            const url = 'https://graphql.anilist.co';
            const opciones = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            };
            const response = yield (0, node_fetch_1.default)(url, opciones);
            const req = yield response.json();
            console.log("LISTA LISTA LISTA");
            console.log(id);
            if (!req.data)
                return null;
            console.log(req.data);
        });
    }
    anime(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.buscar("ANIME", name);
        });
    }
    manga(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.buscar("MANGA", name);
        });
    }
    buscar(tipo, nombre) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
        query ($page: Int, $perPage: Int, $search: String, $type: MediaType) {
            Page (page: $page, perPage: $perPage) {
                pageInfo {
                    total
                    currentPage
                    lastPage
                    hasNextPage
                    perPage
                }
                media (search: $search, type: $type) {
                    id
                    idMal
                    title {
                        english
                        romaji
                        native
                    }
                    type
                    format
                    status
                    description
                    season
                    seasonYear
                    episodes
                    duration
                    chapters
                    volumes
                    coverImage {
                        extraLarge
                    }
                    genres
                    synonyms
                    meanScore
                    popularity
                    favourites
                    siteUrl
                }
            }
        }
        `;
            // Define our query variables and values that will be used in the query request
            const variables = {
                search: nombre,
                type: tipo.toUpperCase(),
                page: 1,
                perPage: 1
            };
            // Define the config we'll need for our Api request
            const url = 'https://graphql.anilist.co';
            const opciones = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query, variables })
            };
            const response = yield (0, node_fetch_1.default)(url, opciones);
            const meta = yield response.json();
            return yield this.cargar(tipo, meta.data.Page.media[0].id);
        });
    }
    cargar(tipo, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                return null;
            const query = `
            query ($id: Int) { # Define which variables will be used in the query (id)
                Media (id: $id, type: ${tipo}) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
                    id
                    idMal
                    title {
                        english
                        romaji
                        native
                    }
                    type
                    format
                    status
                    description
                    season
                    seasonYear
                    episodes
                    duration
                    chapters
                    volumes
                    coverImage {
                        extraLarge
                    }
                    genres
                    synonyms
                    meanScore
                    popularity
                    favourites
                    siteUrl
                }
            }
        `;
            // Define our query variables and values that will be used in the query request
            const variables = {
                id: id
            };
            // Define the config we'll need for our Api request
            const url = 'https://graphql.anilist.co';
            const opciones = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            };
            const response = yield (0, node_fetch_1.default)(url, opciones);
            const req = yield response.json();
            console.log(req.data.Media);
            if (!req.data.Media)
                return null;
            return new Obra_1.Obra(req.data.Media);
        });
    }
    usuario(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
        query ($name: String) {
            User(name: $name) {
                name
                id
                about
                avatar {
                    large
                    medium
                }
                bannerImage
                options {
                    profileColor
                }
                statistics {
                    anime {
                        count
                        meanScore
                        standardDeviation
                        minutesWatched
                        episodesWatched
                        formats {
                            count
                            format
                        }
                        statuses {
                            count
                            status
                        }
                        releaseYears {
                            count
                            releaseYear
                        }
                        startYears {
                            count
                            startYear
                        }
                        genres {
                            count
                            genre
                            meanScore
                            minutesWatched
                        }
                    }
                    manga {
                        count
                        meanScore
                        standardDeviation
                        chaptersRead
                        volumesRead
                        statuses {
                            count
                            status
                        }
                        releaseYears {
                            count
                            releaseYear
                        }
                        startYears {
                            count
                            startYear
                        }
                        genres {
                            count
                            genre
                            meanScore
                            chaptersRead
                        }
                    }
                }
                siteUrl
                updatedAt
            }
        }`;
            const variables = {
                name: username
            };
            const url = 'https://graphql.anilist.co';
            const opciones = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            };
            const response = yield (0, node_fetch_1.default)(url, opciones);
            const req = yield response.json();
            if (!req.data.User)
                return null;
            console.log(req.data.User);
            console.log(req.data.User.statistics);
            return new Usuario_1.Usuario(req.data.User);
        });
    }
    enviarInfoUser(message, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const hexColor = toHex.get(user.getColorName()).value;
            const color = "0x" + hexColor;
            const stats = user.getEstadisticas();
            const EmbedInformacion = new discord_js_1.EmbedBuilder()
                .setTitle(user.getNombre())
                .setURL(user.getURL())
                .setColor(color)
                .setThumbnail(user.getAvatarURL())
                .setImage(user.getBannerImage())
                .setDescription(user.getBio())
                .addFields({
                name: "Animes",
                value: `‣ Vistos: ${stats.anime.count}
                            ‣ Nota Promedio: ${stats.anime.meanScore}
                            ‣ Días Vistos: ${((stats.anime.minutesWatched / 60) / 24).toFixed()}
                            ‣ Episodios Totales: ${stats.anime.episodesWatched}`,
                inline: false
            }, {
                name: "Mangas",
                value: `‣ Leídos: ${stats.manga.count}
                            ‣ Nota Promedio: ${stats.manga.meanScore}
                            ‣ Capítulos Leídos: ${stats.manga.chaptersRead}
                            ‣ Volúmenes Leídos: ${stats.manga.volumesRead}`,
                inline: false
            });
            this.enviarEmbed(message, EmbedInformacion);
        });
    }
    setup(username, message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield this.usuario(username);
            if (!usuario)
                return false;
            const aniuser = new AniUser_1.AniUser();
            aniuser.anilistUsername = usuario.getNombre();
            aniuser.anilistId = usuario.getID();
            aniuser.discordId = message.author.id;
            aniuser.serverId = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.id;
            aniuser.save((err) => {
                console.error(err);
                return false;
            });
            return true;
        });
    }
}
exports.BOT = BOT;
