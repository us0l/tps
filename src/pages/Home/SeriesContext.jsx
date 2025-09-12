import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const SeriesContext = createContext();

export const SeriesProvider = ({ children }) => {
  const [selectedSeries, setSelectedSeries] = useState(null);

  const selectSeries = (series) => {
    setSelectedSeries(series);
  };

  const value = {
    selectedSeries,
    selectSeries,
  };

  return (
    <SeriesContext.Provider value={value}>{children}</SeriesContext.Provider>
  );
};

SeriesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { SeriesContext };
