// frontend/src/App.tsx


import { useState, useEffect, useMemo } from 'react';

import Monitor from './components/Monitor/Monitor.tsx';
import Header from './components/Header/Header.tsx';

import type { FileInfo, Transaction, Filter } from './types';
import { transactionService } from './services/transactionService.tsx';
import { FT } from './services/ft.tsx';

import './index.css';


const initialFilters: Filter = {
    startDate: null,
    endDate: null,
    currency: [],
    type: null,
};


function App() {

    const [files, setFiles] = useState<FileInfo[]>([]);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filters, setFilters] = useState<Filter>(initialFilters);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {

        const loadInitialData = async () => {
            try { setFiles(await transactionService.getFiles()) } 
            catch(e){}
        };
        loadInitialData();

    }, []);

    const handleFileSelection = async (filename: string) => {

        if (!filename) return;

        setSelectedFile(filename);
        setIsLoading(true);
        setTransactions([]); 

        try { setTransactions(await transactionService.getTransactionsByFile(filename)) }
        catch (e) { setTransactions([]) }
        finally { setIsLoading(false) }

    };

    const updateFilter = (key: string, value: any) => {

        if (key === 'currency') {
            setFilters(f => {
                const current = f.currency;
                const next = current.includes(value) ? current.filter(c => c !== value) : [...current, value];
                return { ...f, currency: next };
            });
        } else setFilters(prev => ({ ...prev, [key]: value || null }));
        
    };

    const clearFilters = () => setFilters(initialFilters);

    const currencies = useMemo(() => {
        const uniqueCurrencies = Array.from(new Set(transactions.map(t => t.currency)));
        return uniqueCurrencies.sort();
    }, [transactions]);

    const monitorKey = `${selectedFile}-${JSON.stringify(filters)}`;

    const headerParameters = {
        filters: filters,
        setFilters: updateFilter,
        clearFilters: clearFilters,
        files: files,
        selectedFile: selectedFile,
        onFileChange: handleFileSelection,
        availableCurrencies: currencies,
    }
    const monitorParameters = {
        key: monitorKey,
        externalFilters: { ...filters, selectedFile }, 
        data: transactions, 
        loading: isLoading 
    }

    return (
        <>  
            <Header { ...headerParameters } />
            { (!selectedFile && !isLoading) ? 
            ( <div className='message'>{FT.SELECT_FILE_INITIAL_MESSAGE.ENGLISH}</div> ) : 
            ( <Monitor { ...monitorParameters }/> ) }
        </>
    );

}


export default App;