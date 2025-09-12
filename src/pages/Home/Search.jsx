import { useState, forwardRef, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaSearch } from 'react-icons/fa';
import { useMovie } from './useMovie'; // Import Movie context
import { useSeries } from './useSeries'; // Import Series context

const API_KEY = import.meta.env.VITE_TMDB_API;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const DEBOUNCE_DELAY = 350;
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BLUR_HASH_URL = 'https://image.tmdb.org/t/p/w100';

const ImageWithFallback = ({ src, alt, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className} bg-gray-900`}>
      {isLoading && src && (
        <img
          src={`${BLUR_HASH_URL}${src}`}
          alt="Loading..."
          className="absolute inset-0 w-full h-full object-cover filter blur-md"
        />
      )}
      {!error && src ? (
        <img
          src={`${IMAGE_BASE_URL}${src}`}
          alt={alt}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
          <span className="text-xs">No Image</span>
        </div>
      )}
    </div>
  );
};

const SearchResults = ({ results, selectedIndex, onMouseEnter, onClick }) => {
  const renderResultItem = (item, index) => (
    <div
      key={item.id}
      className={`flex items-center p-2 border-b border-slate-950 cursor-pointer transition-colors duration-200
        ${selectedIndex === index ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
      onMouseEnter={() => onMouseEnter(index)}
      onClick={() => onClick(item)}
    >
      <ImageWithFallback
        src={item.poster_path}
        alt={item.title || item.name}
        className="w-16 h-24 rounded md:w-24 md:h-32"
      />
      <div className="ml-4 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-white">
          {item.title || item.name}
        </h3>
        {item.vote_average && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Rating:</span>
            <span className="text-xs font-medium text-yellow-400">
              {item.vote_average.toFixed(1)}
            </span>
          </div>
        )}
        <span className="text-xs text-gray-500 capitalize">
          {item.media_type}
        </span>
        {item.release_date && (
          <span className="text-xs text-gray-400">
            {new Date(item.release_date).getFullYear()}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="absolute z-10 mt-2 max-h-60 w-full bg-black/95 backdrop-blur-sm rounded-lg overflow-y-auto shadow-lg border border-gray-800">
      {results.map(renderResultItem)}
    </div>
  );
};

const Search = forwardRef(({ onFocus, onBlur, isActive }, ref) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);

  const { selectMovie } = useMovie();
  const { selectSeries } = useSeries();

  const debouncedSearch = useCallback(() => {
    let timeoutId;
    return (searchQuery) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleSearch(searchQuery), DEBOUNCE_DELAY);
      return () => clearTimeout(timeoutId);
    };
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery?.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&language=en-US&page=1&include_adult=false`
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const filteredResults = data.results
        .filter((item) => ['movie', 'tv'].includes(item.media_type))
        .slice(0, 8);

      setResults(filteredResults);
      setSelectedIndex(-1);
    } catch (err) {
      setError(' Please check your internet connection .' + err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyNavigation = useCallback(
    (e) => {
      if (results.length === 0) return;

      const keyHandlers = {
        ArrowDown: () => {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        },
        ArrowUp: () => {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        },
        Enter: () => {
          if (selectedIndex >= 0) {
            const selectedItem = results[selectedIndex];
            const handler =
              selectedItem.media_type === 'movie' ? selectMovie : selectSeries;
            handler(selectedItem);
            clearSearch();
          }
        },
        Escape: () => {
          clearSearch();
        },
      };

      const handler = keyHandlers[e.key];
      if (handler) handler();
    },
    [results, selectedIndex, selectMovie, selectSeries]
  );

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    setError(null);
  };

  useEffect(() => {
    const search = debouncedSearch();
    if (query) {
      const cleanup = search(query);
      return cleanup;
    }
  }, [query, debouncedSearch]);

  const handleItemSelection = useCallback(
    (item) => {
      const handler = item.media_type === 'movie' ? selectMovie : selectSeries;
      handler(item);
      clearSearch();
    },
    [selectMovie, selectSeries]
  );

  const searchInputClasses = useMemo(
    () => `
    w-full bg-gray-800 text-white px-6 py-1.5 rounded-full text-sm
    focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200
    ${isActive ? 'ring-2 ring-white' : ''}
  `,
    [isActive]
  );

  return (
    <div className="relative bg-black/90 w-full px-2 py-2">
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          <input
            ref={ref}
            type="text"
            placeholder="Search movies and TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyNavigation}
            onFocus={onFocus}
            onBlur={onBlur}
            className={searchInputClasses}
            aria-label="Search for movies and TV shows"
            aria-live="polite"
          />
          <FaSearch className="absolute right-3 top-2 text-gray-400 text-sm" />
          {loading && (
            <div className="absolute right-12 top-2 flex items-center gap-2">
              <div className="animate-spin h-4 w-6  rounded-full border-t-transparent"></div>
            </div>
          )}
          {error && <p className=" text-xs mt-1">{error}</p>}
        </div>

        {results.length > 0 && (
          <div>
            <SearchResults
              results={results}
              selectedIndex={selectedIndex}
              onMouseEnter={setSelectedIndex}
              onClick={handleItemSelection}
            />
            <button
              onClick={clearSearch}
              className="mt-2 px-4 py-1.5 text-sm bg-red-600 text-white rounded-md 
                focus:outline-none  transition-colors duration-200"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

ImageWithFallback.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
};

SearchResults.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string,
      name: PropTypes.string,
      poster_path: PropTypes.string,
      vote_average: PropTypes.number,
      media_type: PropTypes.string.isRequired,
      release_date: PropTypes.string,
    })
  ).isRequired,
  selectedIndex: PropTypes.number.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

Search.propTypes = {
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  isActive: PropTypes.bool,
};

Search.displayName = 'Search';

export default Search;
