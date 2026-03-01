// frontend/src/components/CategoryChart/Standard/CategoryChartStandard.tsx


import React, { useMemo, useContext, useCallback, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Sector } from 'recharts';
import { MonitorContext } from '../../../contexts/MonitorContext';
import styles from './CategoryChartStandard.module.css';
import type { Transaction } from '../../../types';
import { FT } from '../../../services/ft';


interface Props {
    data: Transaction[];
    type: 'income' | 'expense';
}


const CategoryChartStandard: React.FC<Props> = ({ data, type }) => {

    const context = useContext(MonitorContext);
    if (!context) throw new Error("CategoryChart must be used within a MonitorProvider");

    const { activeIds, selectedIds, handleHoverOnCategoryChart, handleClickOnCategoryChart, clearSelection } = context;
    const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(null);
    const activeSet = useMemo(() => new Set(activeIds), [activeIds]);
    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const processedGroups = useMemo(() => {
        if (!data || data.length === 0) return [];

        const initialGroups = data.reduce((acc: any, t) => {
            const categoryName = t.category || FT.UNCATEGORIZED.ENGLISH;
            if (!acc[categoryName]) {
                acc[categoryName] = { 
                name: categoryName, 
                amount: 0, 
                ids: [], 
                categories: [categoryName] 
                };
            }
            acc[categoryName].amount += Math.abs((t.amount || 0) / 100);
            acc[categoryName].ids.push(t.id);
            return acc;
        }, {});

        const groupsArray = Object.values(initialGroups);
        const totalValue = groupsArray.reduce((sum: number, curr: any) => sum + curr.amount, 0);
        const sorted = groupsArray.sort((a: any, b: any) => a.amount - b.amount);
        
        const others = { name: FT.OTHERS.ENGLISH, amount: 0, ids: [] as string[], categories: [] as string[] };
        const mainCategories: any[] = [];
        let accumulatedOthersAmount = 0;

        for (const group of sorted) {
            const groupAmount = (group as any).amount;
            const percentageOfTotal = totalValue > 0 ? groupAmount / totalValue : 0;

            if (percentageOfTotal < 0.02 && (accumulatedOthersAmount + groupAmount) <= (totalValue * 0.10)) {
                accumulatedOthersAmount += groupAmount;
                others.amount += groupAmount;
                others.ids.push(...(group as any).ids);
                others.categories.push(...(group as any).categories);
            } else mainCategories.push(group);
        }

        mainCategories.sort((a, b) => b.amount - a.amount);
        return others.amount > 0 ? [...mainCategories, others] : mainCategories;

    }, [data]);


    const colors = useMemo(() => {
        const hue = type === 'income' ? 140 : 0; // GREEN OR RED
        const count = processedGroups.length;
        return processedGroups.map((_, i) => `hsl(${hue}, 60%, ${30 + (i * (40 / (count - 1 || 1)))}%)`);
    }, [processedGroups.length, type]);

    const renderCustomShape = useCallback((props: any) => {
        const { cx, cy, startAngle, endAngle, fill, payload, index } = props;
        
        const isAct = payload.ids?.some((id: string) => activeSet.has(id));
        const isSel = payload.ids?.some((id: string) => selectedSet.has(id));
        const isHover = localHoveredIndex === index;

        const isActiveState = isAct || isSel || isHover;
        const inner = isActiveState ? 45 : 40;
        const outer = isActiveState ? 75 : 80;

        return (
            <Sector
                cx={cx} cy={cy}
                innerRadius={inner}
                outerRadius={outer}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={isAct ? "#ffffff" : fill}
                stroke="none"
                style={{ transition: 'all 0.3s ease', cursor: 'pointer', outline: 'none' }}
            />
        );

    }, [activeSet, selectedSet, localHoveredIndex]);

    const handleGlobalMouseLeave = useCallback(() => {
        setLocalHoveredIndex(null);
        clearSelection();
    }, [clearSelection]);

    return (
        <div className={styles.container} style={{ height: 300, flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }} onMouseLeave={handleGlobalMouseLeave}>
            <Pie
                data={processedGroups}
                cx="65%" 
                cy="50%"
                dataKey="amount"
                stroke="none"
                isAnimationActive={false}
                paddingAngle={4}
                shape={renderCustomShape}
                onMouseEnter={(_, index) => {
                if (processedGroups[index]) {
                    setLocalHoveredIndex(index);
                    handleHoverOnCategoryChart(processedGroups[index].categories, data);
                }
                }}
                onClick={(_, index) => {
                const clickedGroup = processedGroups[index];
                if (!clickedGroup) return;
                const isAlreadySelected = clickedGroup.ids.some((id: string) => selectedSet.has(id));
                if (isAlreadySelected) clearSelection();
                else handleClickOnCategoryChart(clickedGroup.categories, data);
                }}
            >
                {processedGroups.map((entry: any, index: number) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.ids.some((id: string) => activeSet.has(id)) ? "#ffffff" : colors[index]} 
                />
                ))}
            </Pie>
            
            <Legend 
                layout="vertical" 
                align="left" 
                verticalAlign="middle" 
                iconType="circle"
                onMouseEnter={(e: any) => {
                const index = processedGroups.findIndex(g => g.name === e.value);
                if (index !== -1) {
                    setLocalHoveredIndex(index);
                    const cats = e.payload?.payload?.categories || e.payload?.categories;
                    if (cats) handleHoverOnCategoryChart(cats, data);
                }
                }}
                onClick={(e: any) => {
                const payload = e.payload?.payload || e.payload;
                if (payload?.ids) {
                    const isAlreadySelected = payload.ids.some((id: string) => selectedSet.has(id));
                    if (isAlreadySelected) clearSelection();
                    else handleClickOnCategoryChart(payload.categories, data);
                }
                }}
                formatter={(value, entry: any) => {
                const entryData = entry.payload?.payload || entry.payload;
                const isHighlight = 
                    entryData?.ids?.some((id: string) => activeSet.has(id) || selectedSet.has(id)) || 
                    (localHoveredIndex !== null && processedGroups[localHoveredIndex]?.name === value);

                return (
                    <span 
                    className={styles.legendLabel} 
                    style={{ 
                        color: isHighlight ? '#ffffff' : '#cbd5e0', 
                        cursor: 'pointer', 
                        padding: '4px 0', 
                        display: 'inline-block',
                        transition: 'color 0.2s'
                    }}
                    >
                    {value}
                    </span>
                );
                }}
            />
            </PieChart>
        </ResponsiveContainer>
        </div>
    );
};

export default CategoryChartStandard;