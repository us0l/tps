import { useContext } from 'react';
import { MovieContext } from './MoviesContext';

const useMovie = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovie must be used within a MovieProvider');
  }
  return context;
};

export { useMovie };
