import { useContext } from 'react';
import { SeriesContext } from './SeriesContext';

const useSeries = () => {
  const context = useContext(SeriesContext);
  if (!context) {
    throw new Error('useSeries must be used within a SeriesProvider');
  }
  return context;
};

export { useSeries };
