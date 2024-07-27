import { ObjectId } from "mongodb";
import { getMongoIdOrFail } from "../utils/mongo";
import db from "./db";
import { CreateMoneyTransaction, getMoneyTransactionsFilter, MinimalMoneyTransaction, MoneyTransactionContextType } from "../types/MoneyTransactionDto";

const collection = db.collection("moneyTransaction");

async function createMoneyTransaction(item: CreateMoneyTransaction, userId: string) {
    const moneyTransaction: MinimalMoneyTransaction = {
        ...item,
        context: {
            id: getMongoIdOrFail(item.context.id),
            type: item.context.type
        },
        applicable_to: item.applicable_to.map(getMongoIdOrFail),
        owed_to: getMongoIdOrFail(item.owed_to),
        _id: new ObjectId(),
        adjustments: item.adjustments ?? {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: getMongoIdOrFail(userId),
        notes: [],
    };
    await collection.insertOne(moneyTransaction);
}

async function getMoneyTransaction(
    filter: getMoneyTransactionsFilter,
    userId: string
): Promise<{
    owed: MinimalMoneyTransaction[]
    owedTo: MinimalMoneyTransaction[]
}> {
    // all related transactions for user and context
    const context = filter.context;
    const result: {
        owed: MinimalMoneyTransaction[]
        owedTo: MinimalMoneyTransaction[]
    } = {
        owed: [],
        owedTo: [],
    }
    if (!context) {
        const owed = await collection
            .find({
                owed_to: getMongoIdOrFail(userId),
            })
            .toArray();
        result.owed = owed as MinimalMoneyTransaction[];
        const owedTo = await collection
            .find({
                applicable_to: {
                    $in: [getMongoIdOrFail(userId)]
                },
            })
            .toArray();
        result.owedTo = owedTo as MinimalMoneyTransaction[];
        return result;
    }

    // If there is a context, fetch with that context. 
    const contextId = getMongoIdOrFail(context.id);
    const owed = await collection
        .find({
            owed_to: getMongoIdOrFail(userId),
            "context.id": contextId,
            "context.type": context.type,
        })
        .toArray();
    result.owed = owed as MinimalMoneyTransaction[];
    const owedTo = await collection
        .find({
            applicable_to: {
                $in: [getMongoIdOrFail(userId)]
            },
            "context.id": contextId,
            "context.type": context.type,
        })
        .toArray();
    result.owedTo = owedTo as MinimalMoneyTransaction[];
    return result;
}

export default {
    createMoneyTransaction,
    getMoneyTransaction
};


