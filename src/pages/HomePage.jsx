import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { HiX } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { getAllVideos, getUserVideos } from '../api';
import VideoGrid from '../components/Video/VideoGrid';
import Pagination from '../components/UI/Pagination';
import { getErrorMessage } from '../utils/helpers';
import './HomePage.css';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'views', label: 'Most viewed' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortType, setSortType] = useState('desc');

  const searchQuery = searchParams.get('search') || '';
  const sortFromURL = searchParams.get('sort');

  useEffect(() => {
    if (sortFromURL === 'views') {
      setSortBy('views');
      setSortType('desc');
    }
  }, [sortFromURL]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        let res;
        if (searchQuery.startsWith('@')) {
          const targetUsername = searchQuery.slice(1).trim();
          res = await getUserVideos({
            page,
            limit: 20,
            username: targetUsername,
            sortBy,
            sortType,
          });
        } else {
          res = await getAllVideos({
            page,
            limit: 20,
            query: searchQuery,
            sortBy,
            sortType,
          });
        }
        if (res?.data?.data) {
          setVideos(res.data.data.videos || []);
          setTotalCount(res.data.data.totalVideoCount || 0);
        }
      } catch (err) {
        setVideos([]);
        console.warn('Could not fetch videos:', getErrorMessage(err, 'Failed to fetch videos'));
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [page, searchQuery, sortBy, sortType, user?.username]);

  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className="home-page" id="home-page">
      <div className="home-header">
        <div className="home-header-left">
          <h1 className="home-title">
            {searchQuery ? `Results for "${searchQuery}"` : 'Explore'}
          </h1>
          {searchQuery && (
            <Link to="/" className="clear-search-pill" title="Show all videos" id="clear-search-pill">
              Clear search <HiX size={14} />
            </Link>
          )}
          {totalCount > 0 && (
            <span className="home-count">{totalCount} videos</span>
          )}
        </div>

        <div className="home-filters">
          <div className="filter-group">
            <label className="filter-label">Sort by</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              id="sort-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Order</label>
            <select
              className="filter-select"
              value={sortType}
              onChange={(e) => {
                setSortType(e.target.value);
                setPage(1);
              }}
              id="order-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feed Category Pills */}
      <div className="home-tabs-bar">
        <span className="home-tab-pill active">Videos</span>
        <Link to="/community" className="home-tab-pill">
          Community Posts & Tweets
        </Link>
      </div>

      <VideoGrid videos={videos} loading={loading} />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        id="pagination"
      />
    </div>
  );
}
