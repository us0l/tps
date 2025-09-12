import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  const selectMovie = (movie) => {
    setSelectedMovie(movie);
  };

  const value = {
    selectedMovie,
    selectMovie,
  };

  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};

MovieProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { MovieContext };
