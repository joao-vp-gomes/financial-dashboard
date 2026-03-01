// frontend/src/components/Summary/Skeleton/SummarySkeletonCard.tsx


import React from 'react';
import styles from './SummarySkeletonCard.module.css';


interface SkeletonCardProps {
    opacity?: number;
}


const SummaryCardSkeleton: React.FC<SkeletonCardProps> = ({ opacity = 1 }) => {
    
    return (
        <div className={styles.card} style={{ opacity, backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
            <div>
                <div className={`${styles.effect} ${styles.label}`}></div>
                <div className={`${styles.effect} ${styles.date}`}></div>
                <div className={`${styles.effect} ${styles.amount}`}></div>
            </div>
            <div className={`${styles.effect} ${styles.icon}`}></div>
        </div>
    );

};


export default SummaryCardSkeleton;