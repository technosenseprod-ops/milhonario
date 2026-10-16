import React from 'react';
import { TradingViewChartWidget } from './TradingViewChartWidget';

export const TradingViewChart: React.FC<{ height?: number }> = ({ height = 400 }) => {
  return <TradingViewChartWidget height={height} />;
};

export { TradingViewChartWidget };
export default TradingViewChart;
