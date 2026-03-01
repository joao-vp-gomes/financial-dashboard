// frontend/src/components/TimelineChart/Standard/TimelineChartStandard.tsx


import React, { useMemo, useState, useContext, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { MonitorContext } from '../../../contexts/MonitorContext';
import { currencyService } from '../../../services/currencyService';
import type { Transaction } from '../../../types';
import styles from './TimelineChartStandard.module.css';
import { FT } from '../../../services/ft';


interface Props {
    data: Transaction[];
}


const TimelineChartStandard: React.FC<Props> = ({ data }) => {
  
    const context = useContext(MonitorContext);
    if (!context) throw new Error("TransactionChart must be used within a MonitorProvider");

    const { activeIds, selectedIds, selectedFile } = context;
    const currencies = useMemo(() => Array.from(new Set(data.map(t => t.currency))), [data]);
  
    const dominantCurrency = useMemo(() => {

        if (data.length === 0) return 'USD';

        const totals: Record<string, number> = {};
        data.forEach(t => { totals[t.currency] = (totals[t.currency] || 0) + Math.abs(t.amount) });

        return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];

    }, [data]);

    const [displayCurrency, setDisplayCurrency] = useState(dominantCurrency);
    const [convertedData, setConvertedData] = useState<Transaction[]>([]);

    useEffect(() => {
        setDisplayCurrency(dominantCurrency);
    }, [dominantCurrency]);

    useEffect(() => {

        const convertAll = async () => {
            const promises = data.map(async (t) => ({
                ...t,
                convertedAmount: await currencyService.convert(t.amount, t.currency, displayCurrency)
            }));
            const results = await Promise.all(promises);
            setConvertedData(results as any);
        };
        convertAll();

    }, [data, displayCurrency]);

    const dateRange = useMemo(() => {

        if (data.length === 0) return 0;

        const dates = data.map(t => new Date(t.date).getTime());
        const timeSpan = Math.max(...dates) - Math.min(...dates);
        const timeSpanInDays = Math.ceil(timeSpan / (1000 * 60 * 60 * 24)) + 1

        return timeSpanInDays;

    }, [data]);

    const maxPointsPossible = Math.min(10, dateRange || 1);
    const [pointsCount, setPointsCount] = useState(maxPointsPossible);

    const chartData = useMemo(() => {

        if (convertedData.length === 0) return [];

        const dates = data.map(t => new Date(t.date).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        const totalDuration = maxDate - minDate;
        const intervalMs = pointsCount === 1 ? totalDuration : totalDuration / (pointsCount - 1 || 1);
        
        const result = [];
        for (let i = 0; i < pointsCount; i++) {

            const currentPointTime = minDate + (intervalMs * i);
            const startWindow = currentPointTime - (intervalMs / 2);
            const endWindow = currentPointTime + (intervalMs / 2);
            const dateObj = new Date(currentPointTime);
            const label = dateObj.toLocaleDateString('en-US', (dateRange>30 ? {month: 'short', year: '2-digit'} : {day: '2-digit', month: '2-digit'}))
            
            const bucketItems = convertedData.filter(t => {
                const tTime = new Date(t.date).getTime();
                return pointsCount === 1 ? true : (tTime > startWindow && tTime <= endWindow);
            });

            const income = bucketItems.reduce((sum, t: any) => t.convertedAmount > 0 ? sum + (t.convertedAmount / 100) : sum, 0);
            const expense = bucketItems.reduce((sum, t: any) => t.convertedAmount < 0 ? sum + Math.abs(t.convertedAmount / 100) : sum, 0);

            result.push({
                label,
                income,
                expense,
                incomeActive: bucketItems.some(t => t.amount > 0 && activeIds.includes(t.id)),
                incomeSelected: bucketItems.some(t => t.amount > 0 && selectedIds.includes(t.id)),
                expenseActive: bucketItems.some(t => t.amount < 0 && activeIds.includes(t.id)),
                expenseSelected: bucketItems.some(t => t.amount < 0 && selectedIds.includes(t.id)),
                isAnyActive: bucketItems.some(t => activeIds.includes(t.id)),
                isAnySelected: bucketItems.some(t => selectedIds.includes(t.id))
            });

        }
        return result;

    }, [convertedData, pointsCount, dateRange, activeIds, selectedIds]);

  return (
    <>

      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
            {selectedFile ? selectedFile.replace('.csv', '').toUpperCase() : 'TIMELINE'}
        </div>
        <div className={styles.controls}>
          <div className={styles.selectGroup}>
            <label>{FT.DISPLAY_CURRENCY.ENGLISH}</label>
            <select value={displayCurrency} onChange={(e) => setDisplayCurrency(e.target.value)}>
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer} style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3748" />
            <XAxis dataKey="label" stroke="#718096" fontSize={11} tickLine={false} axisLine={false} padding={{ left: 30, right: 30 }} />
            <YAxis stroke="#718096" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip 
              formatter={(value: number | undefined) => {
                if (value === undefined) return ["0.00", ""];
                return [`${value.toFixed(2)} ${displayCurrency}`, ""];
              }}
              contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #2d3748', borderRadius: '8px' }}
              labelStyle={{ color: '#cbd5e0', fontWeight: 'bold' }}
            />
            {chartData.map((entry, index) => 
              (entry.isAnyActive || entry.isAnySelected) && (
                <ReferenceLine key={index} x={entry.label} stroke="white" strokeWidth={2} strokeDasharray="5 5" strokeOpacity={entry.isAnyActive ? 1 : 0.3} />
              )
            )}
            <Area type="monotone" dataKey="income" name="Income" stroke="#31b358" fill="#31b358" fillOpacity={0.1} strokeWidth={3}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.incomeActive) return <circle cx={cx} cy={cy} r={6} fill="white" stroke="#31b358" strokeWidth={2} />;
                if (payload.incomeSelected) return <circle cx={cx} cy={cy} r={6} fill="#31b358" />;
                return null;
              }}
            />
            <Area type="monotone" dataKey="expense" name="Expense" stroke="#e53e3e" fill="#e53e3e" fillOpacity={0.1} strokeWidth={3}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.expenseActive) return <circle cx={cx} cy={cy} r={6} fill="white" stroke="#e53e3e" strokeWidth={2} />;
                if (payload.expenseSelected) return <circle cx={cx} cy={cy} r={6} fill="#e53e3e" />;
                return null;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.sliderContainer}>
        <div className={styles.sliderLabel}>
          <span>Points: {pointsCount}</span>
        </div>
        <input type="range" min="1" max={maxPointsPossible} value={pointsCount} onChange={(e) => setPointsCount(Number(e.target.value))} className={styles.slider} />
      </div>

    </>

  );
};


export default TimelineChartStandard;