// MovieDatabaseApp.js
import React, { useState, useEffect } from 'react';

// Using the provided API key directly
// In production: use environment variables instead for security
const API_KEY = 'c84ec41afaa1013024fbbd6bed9324d6';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function MovieDatabaseApp() {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch popular movies on initial load
  useEffect(() => {
    fetchPopularMovies();
  }, []);

  // Fetch popular movies
  const fetchPopularMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch popular movies');
      }
      const data = await response.json();
      setMovies(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search for movies
  const searchMovies = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=1`);
      if (!response.ok) {
        throw new Error('Failed to search movies');
      }
      const data = await response.json();
      setMovies(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch movie details
  const fetchMovieDetails = async (movieId) => {
    setLoading(true);
    try {
      // Fetch movie details
      const movieResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
      if (!movieResponse.ok) {
        throw new Error('Failed to fetch movie details');
      }
      const movieData = await movieResponse.json();
      setSelectedMovie(movieData);

      // Fetch cast
      const castResponse = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
      if (!castResponse.ok) {
        throw new Error('Failed to fetch cast');
      }
      const castData = await castResponse.json();
      setCast(castData.cast.slice(0, 10)); // Get top 10 cast members

      // Fetch reviews
      const reviewsResponse = await fetch(`${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}&language=en-US&page=1`);
      if (!reviewsResponse.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Go back to movie list
  const goBack = () => {
    setSelectedMovie(null);
    setCast([]);
    setReviews([]);
  };

  // Render movie details
  const renderMovieDetails = () => {
    if (!selectedMovie) return null;

    return (
      <div className="max-w-4xl mx-auto p-4">
        <button 
          className="mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={goBack}
        >
          Back to Movies
        </button>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            {selectedMovie.poster_path ? (
              <img 
                src={`${IMAGE_BASE_URL}${selectedMovie.poster_path}`} 
                alt={selectedMovie.title}
                className="w-full rounded shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-300 flex items-center justify-center rounded">
                No Image Available
              </div>
            )}
          </div>
          
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{selectedMovie.title}</h1>
            <div className="flex items-center mb-4">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">
                {selectedMovie.vote_average.toFixed(1)}/10
              </span>
              <span className="text-gray-600">
                {selectedMovie.release_date && new Date(selectedMovie.release_date).getFullYear()}
              </span>
            </div>
            
            <p className="text-gray-700 mb-4">{selectedMovie.overview}</p>
            
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {selectedMovie.genres.map(genre => (
                  <span key={genre.id} className="bg-gray-200 px-2 py-1 rounded">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Cast</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {cast.map(person => (
                  <div key={person.id} className="text-center">
                    {person.profile_path ? (
                      <img 
                        src={`${IMAGE_BASE_URL}${person.profile_path}`} 
                        alt={person.name}
                        className="w-full rounded"
                      />
                    ) : (
                      <div className="w-full h-20 bg-gray-300 flex items-center justify-center rounded">
                        No Image
                      </div>
                    )}
                    <p className="text-sm mt-1">{person.name}</p>
                    <p className="text-xs text-gray-600">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-gray-100 p-4 rounded">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">{review.author}</h3>
                    <span className="text-gray-600 text-sm">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.content.length > 300 ? 
                    `${review.content.substring(0, 300)}...` : review.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews available for this movie.</p>
          )}
        </div>
      </div>
    );
  };

  // Render movie list
  const renderMovieList = () => {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Movie Database</h1>
        
        <form onSubmit={searchMovies} className="mb-6">
          <div className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies..."
              className="flex-grow p-2 border border-gray-300 rounded-l"
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </form>
        
        {loading ? (
          <div className="flex justify-center">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map(movie => (
              <div 
                key={movie.id} 
                className="bg-white rounded shadow-md overflow-hidden cursor-pointer transition transform hover:scale-105"
                onClick={() => fetchMovieDetails(movie.id)}
              >
                {movie.poster_path ? (
                  <img 
                    src={`${IMAGE_BASE_URL}${movie.poster_path}`} 
                    alt={movie.title}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                    No Image Available
                  </div>
                )}
                <div className="p-2">
                  <h2 className="font-semibold truncate">{movie.title}</h2>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{movie.release_date && movie.release_date.substring(0, 4)}</span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {selectedMovie ? renderMovieDetails() : renderMovieList()}
    </div>
  );
}

export default MovieDatabaseApp;