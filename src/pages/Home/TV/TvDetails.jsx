import { useEffect, useState, useCallback, memo, useRef } from 'react';
import PropTypes from 'prop-types';
import { fetchSeriesDetails } from '../Fetcher';
import {
  FaRedo,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaCalendar,
  FaClock,
} from 'react-icons/fa';
import Loadingspinner from '../resused/Loadingspinner';
import VideoPlayer from './VideoPlayer';

const MemoizedVideoPlayer = memo(VideoPlayer);

const TvDetails = ({ tvId }) => {
  const [tv, setTv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryLoading, setRetryLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const descriptionRef = useRef(null);

  const loadTvData = useCallback(async () => {
    setLoading(true); // Start loading before fetch
    setError(null); // Clear any previous error
    try {
      const data = await fetchSeriesDetails(tvId);
      setTv(data);
    } catch (err) {
      setError(`Error fetching TV data: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      setRetryLoading(false);
    }
  }, [tvId]);

  useEffect(() => {
    loadTvData();
  }, [loadTvData]);

  const handleToggleDescription = () => {
    setShowDescription((prevShowDescription) => !prevShowDescription);
  };

  const truncateDescription = (description, maxLength) => {
    if (!description || description.length <= maxLength) {
      return description;
    }
    return showDescription
      ? description
      : `${description.slice(0, maxLength)}...`;
  };

  const descriptionText = truncateDescription(tv?.overview, 150);
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loadingspinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500 rounded-xl p-8 max-w-md w-full">
          <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
          <button
            onClick={loadTvData}
            className="w-full bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
            disabled={retryLoading}
          >
            <FaRedo className={`${retryLoading ? 'animate-spin' : ''}`} />
            {retryLoading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  if (!tv) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-300 text-lg font-medium">
          No TV data available
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Video Player Section */}
      <div className="w-full h-[40vh] md:h-[60vh] lg:h-[70vh]">
        <MemoizedVideoPlayer tvId={tvId} />
      </div>

      {/* Content Section */}
      <div className="relative z-20 mt-20 md:mt-12 lg:mt-16 min-h-[60vh] md:min-h-[40vh] lg:min-h-[30vh]">
        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Title Section */}

          {/* Description Card */}
          <div className="backdrop-blur rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-4">About this title</h2>
              <div
                className="prose prose-invert max-w-none"
                ref={descriptionRef}
              >
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  {descriptionText}
                </p>
              </div>
              {tv.overview?.length > 150 && (
                <button
                  onClick={handleToggleDescription}
                  className="mt-4 text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors bg-gray-700/50 hover:bg-gray-700/70"
                >
                  {showDescription ? 'Show less' : 'Show more'}
                  {showDescription ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800/60 rounded-full text-sm">
                <FaStar className="text-yellow-500" />
                <span className="font-medium">
                  {tv.vote_average?.toFixed(1)}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800/60 rounded-full text-sm">
                <FaCalendar className="text-gray-400" />
                <span className="font-medium">{tv.release_date}</span>
              </span>
              {tv.runtime && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800/60 rounded-full text-sm">
                  <FaClock className="text-gray-400" />
                  <span className="font-medium">{tv.runtime}m</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TvDetails.propTypes = {
  tvId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default memo(TvDetails);
