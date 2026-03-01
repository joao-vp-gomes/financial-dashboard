// frontend/src/components/CategoryChart/CategoryChartSkeleton.tsx


import React from 'react';
import styles from './CategoryChartSkeleton.module.css';


const CategoryChartSkeleton: React.FC = () => {
    return (
        <div className={styles.container} style={{ height: 300 }}>

            <div className={styles.legendContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={styles.legendItem}>
                        <div className={`${styles.effect} ${styles.dot}`}></div>
                        <div className={`${styles.effect} ${styles.line}`}></div>
                    </div>
                ))}
            </div>

            <div className={styles.chartCircleContainer}>
                <div className={`${styles.effect} ${styles.circle}`}>
                    <div className={styles.innerVoid}></div>
                </div>
            </div>

        </div>
    );
};


export default CategoryChartSkeleton;