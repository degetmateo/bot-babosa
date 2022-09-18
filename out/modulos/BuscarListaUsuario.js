"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuscarListaUsuario = void 0;
function BuscarListaUsuario(bot, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const variables = { username };
        const response = yield bot.request(queryLista, variables);
        return (response == null) ? null : response;
    });
}
exports.BuscarListaUsuario = BuscarListaUsuario;
const queryLista = `
    query ($username: String) {
        animeList: MediaListCollection(userName: $username, type: ANIME) {
            user {
                name
                avatar {
                    large
                }
                options {
                    profileColor
                }
                siteUrl
            }
            lists {
                entries {
                    mediaId,
                    score(format: POINT_100)
                }
            }
        }
        mangaList: MediaListCollection(userName: $username, type: MANGA) {
            lists {
                entries {
                    mediaId,
                    score(format: POINT_100)
                }
            }
        }
    }
`;
