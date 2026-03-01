// frontend/src/components/Summary/Summary.tsx


import type { Transaction } from '../../types/index.ts';
import { useContext, useMemo } from 'react';
import MonitorContext from '../../contexts/MonitorContext.tsx';
import SummarySkeletonCard from './Skeleton/SummarySkeletonCard.tsx';
import SummaryStandardCard from './Standard/SummaryStandardCard.tsx';
import styles from './Summary.module.css';
import React from 'react';


interface Props {
    data: Transaction[];
    loading: boolean;
}
 

const Summary: React.FC<Props> = ({ data, loading }) => {

    const context = useContext(MonitorContext);
    if (!context) throw new Error("Summary must be used within a MonitorProvider");

    const { activeIds, selectedIds, clearActiveList, handleClick, handleHover, clearSelection } = context;

    const activeSet = useMemo(() => new Set(activeIds), [activeIds]);
    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const renderContent = () => {

        if (loading) {
            return (
                <>
                    <SummarySkeletonCard opacity={0.35} />
                    <SummarySkeletonCard opacity={0.35} />
                    <SummarySkeletonCard opacity={0.35} />
                    <SummarySkeletonCard opacity={0.25} />
                    <SummarySkeletonCard opacity={0.2} />
                    <SummarySkeletonCard opacity={0.15} />
                    <SummarySkeletonCard opacity={0.12} />
                    <SummarySkeletonCard opacity={0.1} />
                    <SummarySkeletonCard opacity={0.05} />
                </>
            );
        }

        if (data.length === 0) return null;
        
        return data.map((item, index) => {

            const isActive = activeSet.has(item.id);
            const isSelected = selectedSet.has(item.id);

            const isFirstOfDate = index === 0 || data[index - 1].date !== item.date;
            
            const summaryStandardCardParameters = {
                transaction: item,
                isActive: isActive,
                isSelected: isSelected,
                onToggle: () => isActive ? clearActiveList() : handleClick(item.id, data),
                onMouseEnter: () => handleHover(item.id, data),
                onMouseLeave: clearSelection,
            }

            return (
                <React.Fragment key={item.id}>
                    {isFirstOfDate && (
                        <div className={styles.dateDivider}>
                            <span>{item.date.replaceAll('-', '.')}</span>
                            <div className={styles.line}></div>
                        </div>
                    )}
                    <SummaryStandardCard { ...summaryStandardCardParameters } />
                </React.Fragment>
            );
        });
        
    };

    return (
        <div className={styles.summary}>
            {renderContent()}
        </div>
    );

};


export default Summary;