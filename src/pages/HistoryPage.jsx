import { useState, useEffect } from 'react';
import { getWatchHistory } from '../api';
import VideoGrid from '../components/Video/VideoGrid';
import './LikedVideosPage.css';

export default function HistoryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getWatchHistory();
        setVideos(data?.data || []);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="history-page" id="history-page">
      <h1 className="page-title">Watch History</h1>
      <p className="page-subtitle">{videos.length} videos in your history</p>

      <VideoGrid videos={videos} loading={loading} />
    </div>
  );
}
