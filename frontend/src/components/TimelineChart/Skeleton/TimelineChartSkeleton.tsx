// frontend/src/components/TimelineChart/Skeleton/TimelineChartSkeleton.tsx


import React from 'react';
import styles from './TimelineChartSkeleton.module.css';


const TimelineChartSkeleton: React.FC = () => {
    return (
        <>

            <div className={styles.header}>
                <div className={`${styles.pulse} ${styles.title}`}></div>
                <div className={styles.selectGroup}>
                    <div className={`${styles.pulse} ${styles.label}`}></div>
                    <div className={`${styles.pulse} ${styles.select}`}></div>
                </div>
            </div>

            <div className={styles.chartArea}>
                {[1, 2, 3, 4].map(i => <div key={i} className={styles.gridLine}></div>)}
            </div>

            <div className={styles.sliderContainer}>
                <div className={`${styles.pulse} ${styles.sliderLabel}`}></div>
                <div className={`${styles.pulse} ${styles.sliderBar}`}></div>
            </div>

        </>
    );
};


export default TimelineChartSkeleton;