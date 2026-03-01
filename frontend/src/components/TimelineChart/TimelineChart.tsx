// frontend/src/components/TimelineChart/TimelineChart.tsx


import React from 'react';
import type { Transaction } from '../../types';
import TimelineChartStandard from './Standard/TimelineChartStandard';
import TimelineChartSkeleton from './Skeleton/TimelineChartSkeleton';
import styles from './TimelineChart.module.css'


interface Props {
    data: Transaction[];
    loading: boolean;
}


const TimelineChart: React.FC<Props> = ({ data, loading }) => {

    const renderContent = () => {
        if (loading) return <TimelineChartSkeleton />;
        if (data.length === 0) return null;
        return <TimelineChartStandard data={data} />;
    }

    return (
        <div className={styles.timelineChart}>
            {renderContent()}
        </div>
    );
    
};
 

export default TimelineChart;