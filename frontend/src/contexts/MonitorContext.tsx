// frontend/src/contexts/MonitorContext.tsx


import React, { createContext, useState, useCallback, useMemo, useRef } from 'react';
import type { Transaction } from '../types';


interface MonitorContextType {

    selectedFile: string;
    activeIds: string[];
    selectedIds: string[];

    handleHover: (id: string, data: Transaction[]) => void;
    handleHoverOnChart: (startDate: string, endDate: string, data: Transaction[]) => void;
    handleHoverOnCategoryChart: (categories: string[], data: Transaction[]) => void;
    clearSelection: () => void;

    handleClick: (id: string, data: Transaction[]) => void;
    handleClickOnChart: (startDate: string, endDate: string, data: Transaction[]) => void;
    handleClickOnCategoryChart: (categories: string[], data: Transaction[]) => void;
    clearActiveList: () => void;

}

export const MonitorContext = createContext<MonitorContextType | undefined>(undefined);

export const MonitorProvider: React.FC<{ children: React.ReactNode, selectedFile: string }> = ({ children, selectedFile }) => {
    
    const [activeSet, setActiveSet] = useState<Set<string>>(new Set());
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
    const hoverTimeoutRef = useRef<number | undefined>(undefined);

    const getFilteredIdsSet = (data: Transaction[], predicate: (t: Transaction) => boolean) => {
        const newSet = new Set<string>();
        data.forEach(t => { if (predicate(t)) newSet.add(t.id); });
        return newSet;
    };


    const debounceHover = useCallback((fn: () => void) => {
        if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = window.setTimeout(fn, 10); 
    }, []);

    const handleHoverOnSummaryCard = useCallback((id: string, data: Transaction[]) => {
        debounceHover(() => setSelectedSet(getFilteredIdsSet(data, t => t.id === id)));
    }, [debounceHover]);

    const handleHoverOnChart = useCallback((startDate: string, endDate: string, data: Transaction[]) => {
        debounceHover(() => setSelectedSet(getFilteredIdsSet(data, t => t.date >= startDate && t.date <= endDate)));
    }, [debounceHover]);

    const handleHoverOnCategoryChart = useCallback((categories: string[], data: Transaction[]) => {
        const catSet = new Set(categories);
        debounceHover(() => setSelectedSet(getFilteredIdsSet(data, t => catSet.has(t.category))));
    }, [debounceHover]);

    const clearSelection = useCallback(() => {
        if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
        setSelectedSet(new Set());
    }, []);


    const handleClickOnSummaryCard = useCallback((id: string, data: Transaction[]) => {
        setActiveSet(getFilteredIdsSet(data, t => t.id === id));
    }, []);

    const handleClickOnChart = useCallback((startDate: string, endDate: string, data: Transaction[]) => {
        setActiveSet(getFilteredIdsSet(data, t => t.date >= startDate && t.date <= endDate));
    }, []);

    const handleClickOnCategoryChart = useCallback((categories: string[], data: Transaction[]) => {
        const catSet = new Set(categories);
        setActiveSet(getFilteredIdsSet(data, t => catSet.has(t.category)));
    }, []);

    const clearActiveList = useCallback(() => {
        setActiveSet(new Set()) 
    }, []);


    const contextValue = useMemo(() => ({
        selectedFile,
        activeIds: Array.from(activeSet),
        selectedIds: Array.from(selectedSet),
        handleHover: handleHoverOnSummaryCard,
        handleHoverOnChart,
        handleHoverOnCategoryChart,
        clearSelection,
        handleClick: handleClickOnSummaryCard,
        handleClickOnChart,
        handleClickOnCategoryChart,
        clearActiveList
    }), [selectedFile, activeSet, selectedSet, handleHoverOnSummaryCard, handleHoverOnChart, handleHoverOnCategoryChart, clearSelection, clearActiveList]);

    return <MonitorContext.Provider value={contextValue}>{children}</MonitorContext.Provider>;

};


export default MonitorContext;