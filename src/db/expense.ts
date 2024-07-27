import { ObjectId } from "mongodb";
import { getMongoIdOrFail } from "../utils/mongo";
import db from "./db";
import { CreateMoneyTransaction, getMoneyTransactionsFilter, MinimalMoneyTransaction, MoneyTransactionContextType } from "../types/MoneyTransactionDto";

const collection = db.collection("moneyTransaction");

async function createMoneyTransaction(item: CreateMoneyTransaction & {
    created_at?: string,
    updated_at?: string,
}, userId: string) {
    const moneyTransaction: MinimalMoneyTransaction = {
        ...item,
        context: {
            id: getMongoIdOrFail(item.context.id),
            type: item.context.type
        },
        applicable_to: item.applicable_to,
        owed_to: getMongoIdOrFail(item.owed_to),
        _id: new ObjectId(),
        adjustments: item.adjustments ?? {},
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
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
    console.log("filter")
    console.log(filter)
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
            .sort({ created_at: -1 })
            .toArray();
        result.owed = owed as MinimalMoneyTransaction[];
        const owedTo = await collection
            .find({
                applicable_to: {
                    $in: [userId]
                },
            })
            .sort({ created_at: -1 })
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
                $in: [userId]
            },
            "context.id": contextId,
            "context.type": context.type,
        })
        .toArray();
    result.owedTo = owedTo as MinimalMoneyTransaction[];
    return result;
}

function deleteMoneyTransaction(id: string, userId: string) {
    // check if the transaction exists and the user is the creator / owner
    return collection.deleteOne({
        _id: getMongoIdOrFail(id),
        $or: [
            { created_by: getMongoIdOrFail(userId) },
            { owed_to: getMongoIdOrFail(userId) },
        ],
    });
}

function addMoneyTransactionAdjustment(
    id: string,
    userId: string,
    adjustments: {
        [key: string]: number;
    }
) {
    return collection.updateOne(
        {
            _id: getMongoIdOrFail(id),
        },
        {
            $set: {
                adjustments: adjustments,
            },
        }
    );
}

export default {
    createMoneyTransaction,
    getMoneyTransaction,
    deleteMoneyTransaction,
    addMoneyTransactionAdjustment,
};


