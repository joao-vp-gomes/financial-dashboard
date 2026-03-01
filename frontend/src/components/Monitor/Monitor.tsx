// frontend/src/components/Monitor/Monitor.tsx


import React, { useMemo } from 'react';
import styles from './Monitor.module.css';
import Summary from '../Summary/Summary.tsx';
import CategoryChart from '../CategoryChart/CategoryChart.tsx';
import type { Transaction } from '../../types/index.ts';
import { MonitorProvider } from '../../contexts/MonitorContext.tsx';
import TimelineChart from '../TimelineChart/TimelineChart.tsx';


interface Props {
    data: Transaction[];
    externalFilters: any;
    loading: boolean;
}


const Monitor: React.FC<Props> = ({ data, externalFilters, loading }) => {

    const filteredData = useMemo(() => {

        if (loading) return [];

        return data.filter(t => {
            const matchesStart = !externalFilters.startDate || t.date >= externalFilters.startDate;
            const matchesEnd = !externalFilters.endDate || t.date <= externalFilters.endDate;
            const matchesCurrency = externalFilters.currency.length === 0 || externalFilters.currency.includes(t.currency);
            const matchesType = !externalFilters.type || ( externalFilters.type === 'income' ? t.amount > 0 : t.amount < 0 );
            
            return matchesStart && matchesEnd && matchesCurrency && matchesType;
        });

    }, [data, externalFilters, loading]);

    return (
        <MonitorProvider selectedFile={externalFilters.selectedFile || 'Financial Monitor'}>
            <div className={styles.monitor}> 
                <Summary data={filteredData} loading={loading} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px'}}>
                    <TimelineChart data={filteredData} loading={loading} />
                    <CategoryChart data={filteredData} isLoading={loading} />
                </div>
            </div>
        </MonitorProvider>
    );

};


export default Monitor;