// frontend/src/services/transactionService.ts


import { API } from './api';
import type { Transaction, FileInfo } from '../types';


export const transactionService = {

    async getFiles(): Promise<FileInfo[]> { return API.get<FileInfo[]>('/files'); },

    async getTransactionsByFile(filename: string): Promise<Transaction[]> {

        const data = await API.get<Transaction[]>(`/transactions/${filename}`);
        
        return data.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
        });

    },

    async getSummaryByFile(filename: string): Promise<any> { return API.get(`/summary/${filename}`); }

};