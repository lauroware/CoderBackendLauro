import { userModel } from "../models/users.model.js";
import { ContenedorMongoDb } from "../persistence/mongoDbPersistence.js";
import UserDTO from "../DTOs/users.dto.js";
import { createHash } from "../utils/index.js";

const userDtoFromObj = (obj) => {
    const { _id, first_name, last_name, email, age, password, role, cartId } = obj;
    let userDTO = new UserDTO(_id, `${first_name} ${last_name}`, email, age, password, role, cartId);
    return userDTO
}

const allUsersDtoFromObj = (users) => {
    return users.map((user) => {
        const { _id, first_name, last_name, email, age, password, role, cartId } = user;
        return new UserDTO(_id, `${first_name} ${last_name}`, email, age, password, role, cartId);
    });
};

class UsersDAOMongoDb extends ContenedorMongoDb {
    async getAllUsers() {
        try {
            const users = await userModel.find();
            return allUsersDtoFromObj(users);
        } catch (error) {
            throw new Error(error);
        }
    }
    async getUserByEmail(email) {
        try {
            const user = await userModel.findOne({ email: email }).lean();
            return user;
        } catch (error) {
            throw new Error(error);
        }
    }

    async saveUser(newUser, cid) {
        try {
            const savedUser = await this.save({ ...newUser, cartId: cid });
            return userDtoFromObj(savedUser)
        } catch (error) {
            throw new Error(error);
        }
    }

    async findUser(user) {
        let existUser = await userModel.findOne({ email: user.email });
        if (!existUser) return { status: "error", payload: "Usuario inexistente" };
        return userDtoFromObj(existUser);
    }

    async updateUserRole(uid, newRole) {
        try {
            const updatedUser = await userModel.findOneAndUpdate(
                { _id: uid },
                { role: newRole },
                { new: true }
            );

            if (!updatedUser) {
                return { status: "error", payload: "Usuario inexistente" };
            }

            return updatedUser;
        } catch (error) {
            throw new Error(error);
        }
    }

    async restorePassword(email, newPassword) {
        try {
            const updatedUser = await userModel.findOneAndUpdate(
                { email: email },
                { password: createHash(newPassword) },
                { new: true }
            );

            if (!updatedUser) {
                return { status: "error", payload: "Usuario inexistente" };
            }

            return updatedUser;
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteUsers() {
        try {
            const deleteAll = await this.deleteAll();
            return deleteAll;
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteUserById(uid) {
        try {
            let existUser = await userModel.findOne({ _id: uid });
            if (!existUser) return { status: "error", payload: "Usuario inexistente" };
            const deletedUser = await this.delete(existUser);
            return userDtoFromObj(deletedUser);
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteInactiveUsers() {
        try {
            // Obtén la fecha actual hace dos días
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            // Encuentra y elimina los usuarios inactivos
            const inactiveUsers = await userModel.deleteMany({
                lastLoginDate: { $lt: twoDaysAgo },
            });

            return inactiveUsers;
        } catch (error) {
            throw new Error('Error al eliminar usuarios inactivos.');
        }
    }
}

export default UsersDAOMongoDb
