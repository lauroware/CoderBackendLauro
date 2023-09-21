import mongoose from "mongoose";

class ContenedorMongoDb {
    constructor(collection, schema) {
        this.collection = mongoose.model(collection, schema);
    }

    async getById(id) {
        try {
            let docs = await this.collection.findOne({ "_id": id }, { __v: 0 }).lean();
            if (docs.length == 0) {
                throw new Error("ID not found");
            } else {
                return docs;
            }
        } catch (error) {
            throw new Error(`Error trying to get product by ID: ${error}`);
        }
    }

    async getAll() {
        try {
            const docs = await this.collection.find({}, { __v: 0 }).lean();
            if (docs.length == 0) {
                throw new Error("ID not found");
            } else {
                return docs;
            }
        } catch (error) {
            throw new Error(`Error trying to get products: ${error}`);
        }
    }

    async save(newElem) {
        try {
            let doc = await this.collection.create(newElem);
            return doc;
        } catch (error) {
            throw new Error(`Error saving new element: ${error}`);
        }
    }

    async update(id, newElem) {
        try {
            const { n, nModified } = await this.collection.replaceOne({ "_id": id }, newElem, { new: true });
            if (n == 0 || nModified == 0) {
                throw new Error("Error updating: Not Found");
            } else {
                return newElem
            }
        } catch (error) {
            throw new Error(`Error updating: ${error}`);
        }
    }

    async delete(id) {
        try {
            const { n, nDeleted } = await this.collection.deleteOne({ "_id": id });
            if (n == 0 || nDeleted == 0) {
                throw new Error("Error deleting: Not Found");
            }
        } catch (error) {
            throw new Error(`Error deleting: ${error}`);
        }
    }
    async deleteAll() {
        try {
            await this.collection.deleteMany({});
        } catch (error) {
            throw new Error(`Error deleting: ${error}`);
        }
    }
}

export { ContenedorMongoDb };