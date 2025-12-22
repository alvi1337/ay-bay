import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BarChartProps {
  data: { label: string; income: number; expense: number }[];
  height?: number;
}

export function SimpleBarChart({ data, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expense]));

  return (
    <View style={[styles.barChartContainer, { height }]}>
      <View style={styles.barsContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barGroup}>
            <View style={styles.barPair}>
              <View
                style={[
                  styles.bar,
                  styles.incomeBar,
                  { height: maxValue > 0 ? (item.income / maxValue) * (height - 40) : 0 },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  styles.expenseBar,
                  { height: maxValue > 0 ? (item.expense / maxValue) * (height - 40) : 0 },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Expense</Text>
        </View>
      </View>
    </View>
  );
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function SimplePieChart({ data, size = 160 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <View style={[styles.pieContainer, { width: size, height: size }]}>
        <View style={[styles.emptyPie, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={styles.emptyText}>No Data</Text>
        </View>
      </View>
    );
  }

  // Calculate percentages for display
  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1),
  }));

  return (
    <View style={styles.pieWrapper}>
      <View style={[styles.pieContainer, { width: size, height: size }]}>
        {/* Simple visual representation using stacked segments */}
        <View style={[styles.pieChart, { width: size, height: size, borderRadius: size / 2 }]}>
          {dataWithPercentage.slice(0, 5).map((item, index) => {
            const rotation = dataWithPercentage
              .slice(0, index)
              .reduce((sum, d) => sum + (d.value / total) * 360, 0);
            const angle = (item.value / total) * 360;
            
            return (
              <View
                key={index}
                style={[
                  styles.pieSegment,
                  {
                    backgroundColor: item.color,
                    transform: [{ rotate: `${rotation}deg` }],
                    opacity: 0.9 - index * 0.1,
                  },
                ]}
              />
            );
          })}
          <View style={[styles.pieCenter, { width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25 }]}>
            <Text style={styles.pieCenterText}>{data.length}</Text>
            <Text style={styles.pieCenterLabel}>Categories</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.pieLegend}>
        {dataWithPercentage.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.pieLegendItem}>
            <View style={[styles.pieLegendDot, { backgroundColor: item.color }]} />
            <Text style={styles.pieLegendLabel} numberOfLines={1}>{item.label}</Text>
            <Text style={styles.pieLegendValue}>{item.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

interface ProgressBarProps {
  value: number;
  maxValue: number;
  color: string;
  label: string;
  showAmount?: boolean;
  formatAmount?: (val: number) => string;
}

export function ProgressBar({
  value,
  maxValue,
  color,
  label,
  showAmount = true,
  formatAmount,
}: ProgressBarProps) {
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        {showAmount && (
          <Text style={styles.progressAmount}>
            {formatAmount ? formatAmount(value) : value.toLocaleString()}
          </Text>
        )}
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Bar Chart Styles
  barChartContainer: {
    padding: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    flex: 1,
    paddingBottom: 8,
  },
  barGroup: {
    alignItems: 'center',
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  bar: {
    width: 16,
    borderRadius: 4,
    minHeight: 4,
  },
  incomeBar: {
    backgroundColor: '#10B981',
  },
  expenseBar: {
    backgroundColor: '#EF4444',
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 6,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },

  // Pie Chart Styles
  pieWrapper: {
    alignItems: 'center',
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChart: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pieSegment: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    left: '50%',
    transformOrigin: 'left center',
  },
  pieCenter: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  pieCenterText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  pieCenterLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  emptyPie: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  pieLegend: {
    marginTop: 16,
    width: '100%',
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  pieLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  pieLegendLabel: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  pieLegendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Progress Bar Styles
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  progressAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
