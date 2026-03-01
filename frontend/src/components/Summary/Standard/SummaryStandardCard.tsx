// frontend/src/components/Summary/Standard/SummaryStandardCard.tsx


import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import styles from './SummaryStandardCard.module.css';
import type { Transaction } from '../../../types';
import React, { memo } from 'react';


interface Props {
    transaction: Transaction;
    isActive: boolean;
    isSelected: boolean;
    onToggle: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}


const SummaryStandardCard: React.FC<Props> = memo(({ transaction, isActive, isSelected, onToggle, onMouseEnter, onMouseLeave }) => {
    
    const type = transaction.amount > 0 ? 'income' : 'expense';
    const icon = type === 'income' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />;
    const sign = type === 'income' ? '+' : '-';
    const cardClasses = `${styles.card} ${styles[type]} ${isSelected ? styles.selected : ''} ${isActive ? styles.active : ''}`;

    return (
        <div className={cardClasses} onClick={onToggle} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div>
                <p className={styles.label}>{transaction.description} ({transaction.category})</p>
                <p className={styles.label}>{transaction.date.replaceAll('-', '.')}</p>
                <p className={styles.amount}>
                    {sign} {transaction.currency} {(Math.abs(transaction.amount / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
            </div>
            <div className={styles.icon}>{icon}</div>
        </div>
    );

});


export default SummaryStandardCard;