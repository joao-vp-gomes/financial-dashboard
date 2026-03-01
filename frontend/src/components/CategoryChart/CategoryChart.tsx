// frontend/src/components/CategoryChart/CategoryChart.tsx


import React, { useMemo } from 'react';
import type { Transaction } from '../../types';
import CategoryChartStandard from './Standard/CategoryChartStandard';
import CategoryChartSkeleton from './Skeleton/CategoryChartSkeleton';
import styles from './CategoryChart.module.css'


interface Props {
    data: Transaction[];
    loading: boolean;
}


const CategoryChart: React.FC<Props> = ({ data, loading }) => {

    const expenses = useMemo(() => data.filter(t => t.amount < 0), [data]);
    const incomes = useMemo(() => data.filter(t => t.amount > 0), [data]);

    const renderContent = () => {

        if (loading) {
            return (
                <>
                    <CategoryChartSkeleton />
                    <CategoryChartSkeleton />
                </>
            );
        }

        return (
            <>
                <CategoryChartStandard data={incomes} type={'income'} />
                <CategoryChartStandard data={expenses} type={'expense'} />
            </>
        );
        
    }

    return (
        <div className={styles.categoryChart}>
            {renderContent()}
        </div>
    );

};


export default CategoryChart;