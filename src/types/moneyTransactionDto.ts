import { ObjectId } from "mongodb";


export type MoneyTransactionContextType = 'event' | 'user'
export type MoneyTransactionType = 'expense' | 'payment'
// ====================== Expense ====================
export interface MoneyTransactionNote {
    text: string;
    media: string[];
    created_at: string;
    created_by: ObjectId;
}

export enum Currency {
    AUD = 'AUD',
    VND = 'VND',
    USD = 'USD',
    THB = 'THB',
}

export interface MinimalMoneyTransaction {
    _id: ObjectId;
    created_by: ObjectId;

    // when the transaction is for another user
    owed_to: ObjectId;

    created_at: string;
    updated_at: string;

    name: string;
    currency: Currency;
    amount: number;
    media: string[];

    /** Every user involved in the transaction
     * and their adjustments
     */
    applicable_to: ObjectId[];
    adjustments: {
        [key: string]: number;
    };

    /** What the expense is attached to */
    context: {
        id: ObjectId;
        type: MoneyTransactionContextType
    }

    /** A transaction is either an expense or a payment */
    type: MoneyTransactionType
    /** Additional notes that can be attached to the expense.
     * These can be comments
     */
    notes: MoneyTransactionNote[]

}

export interface CreateMoneyTransaction {
    name: string;
    owed_to: string;
    currency: Currency;
    amount: number;
    media: string[];
    applicable_to: string[];
    adjustments?: {
        [key: string]: number;
    }
    context: {
        id: string;
        type: MoneyTransactionContextType
    }
    type: MoneyTransactionType
}

export interface getMoneyTransactionsFilter {
    context?: {
        id: string;
        type: MoneyTransactionContextType
    }
}