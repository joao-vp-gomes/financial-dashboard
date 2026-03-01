// frontend/src/components/Header/Header.tsx


import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';
import type { FileInfo, Filter } from '../../types';
import { FT } from '../../services/ft';


interface Props {
    filters: Filter;
    setFilters: (key: string, value: any) => void;
    clearFilters: () => void;
    files: FileInfo[];
    selectedFile: string;
    onFileChange: (filename: string) => void;
    availableCurrencies: string[];
}


const Header: React.FC<Props> = ({ filters, setFilters, clearFilters, files, selectedFile, onFileChange, availableCurrencies }) => {
    
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsCurrencyOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeCurrencies = filters.currency || [];
    const areAllSelected = activeCurrencies.length === availableCurrencies.length;
    
    const hasActiveFilters = filters.startDate || filters.endDate || filters.type || !areAllSelected;

    const filterComponents = (
        <>
            <div className={styles.filterGroup}>
                <label>{FT.START_DATE.ENGLISH}</label>
                <input type="date" value={filters.startDate || ''} onChange={(e) => setFilters('startDate', e.target.value)} />
            </div>

            <div className={styles.filterGroup}>
                <label>{FT.END_DATE.ENGLISH}</label>
                <input type="date" value={filters.endDate || ''} onChange={(e) => setFilters('endDate', e.target.value)} />
            </div>

            <div className={styles.filterGroup} ref={dropdownRef}>
                <label>{FT.CURRENCIES.ENGLISH}</label>
                <div className={styles.customDropdown}>

                    <button type="button" className={styles.dropdownTrigger} onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}>
                        <span> {areAllSelected ? 'All Currencies' : `${activeCurrencies.length} Selected`} </span>
                        <span className={styles.arrow}>{isCurrencyOpen ? '▲' : '▼'}</span>
                    </button>

                    {isCurrencyOpen && (
                        <div className={styles.dropdownMenu}>
                            {availableCurrencies.map(curr => (
                                <label key={curr} className={styles.dropdownItem}>
                                    <input type="checkbox" checked={activeCurrencies.includes(curr)} onChange={() => setFilters('currency', curr)} />
                                    <span className={styles.currencyName}>{curr}</span>
                                </label>
                            ))}
                        </div>
                    )}

                </div>
            </div>

            <div className={styles.filterGroup}>
                <label>{FT.TYPE.ENGLISH}</label>
                <select value={filters.type || ''} onChange={(e) => setFilters('type', e.target.value)}>
                    <option value="">{FT.ALL.ENGLISH}</option>
                    <option value="income">{FT.INCOMES.ENGLISH}</option>
                    <option value="expense">{FT.EXPENSES.ENGLISH}</option>
                </select>
            </div>

            {hasActiveFilters && (
                <button className={styles.clearBtn} onClick={clearFilters}>
                    {FT.CLEAR_FILTERS.ENGLISH}
                </button>
            )}
        </>
    );


    return (

        <header className={styles.header}>

            <div className={styles.logo}>FinancialDashboard</div>
            
            <div className={styles.filters}>

                <div className={styles.filterGroup}>
                    <label>{FT.DATA_SOURCE.ENGLISH}</label>
                    <select value={selectedFile} onChange={(e) => onFileChange(e.target.value)} className={styles.fileSelect}>
                        <option value="" disabled>{FT.SELECT_FILE.ENGLISH}</option>
                        {files.map(file => (
                            <option key={file.name} value={file.name}>
                                {file.name} ({file.transactions_count})
                            </option>
                        ))}
                    </select>
                </div>
                
                { selectedFile ? filterComponents : null}

            </div>

        </header>
    );
};


export default Header;