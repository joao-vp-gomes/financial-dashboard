// frontend/src/types/index.ts


// Centralizes all interfaces.
// If it gets too big, I`ll make a file for each interface.


export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    source: string;
    currency: string;
}

export interface FinancialSummary {
    total_in: number;
    total_out: number;
    balance: number;
    transaction_count: number;
}

export interface FileInfo {
    name: string;
    transactions_count: number;
}

export interface Filter {
    startDate: string | null;
    endDate: string | null;
    currency: string[]; 
    type: 'income' | 'expense' | null;
}