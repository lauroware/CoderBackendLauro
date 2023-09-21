import TokenDAOMongoDb from "../daos/tokenMongooseDao.js";
import { tokenSchema } from "../models/token.model.js";
const tokenDAO = new TokenDAOMongoDb('tokens', tokenSchema);

class TokenRepository {
    async findAllTokens() {
        return tokenDAO.findAllTokens();
    }

    async findTokenByUserId(email){
        return tokenDAO.findTokenByUserId(email);
    }

    async createToken(newToken){
        return tokenDAO.createToken(newToken);
    }

    async updateToken(token) {
        return tokenDAO.updateToken(token);
    }

    async deleteTokenById(tokenId) {
        return tokenDAO.deleteTokenById(tokenId);
    }

    async
}

export default TokenRepository;