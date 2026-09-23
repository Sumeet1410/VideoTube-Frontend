import { useState, useEffect } from 'react';
import { getLikedVideos } from '../api';
import VideoGrid from '../components/Video/VideoGrid';
import Loader from '../components/UI/Loader';
import './LikedVideosPage.css';

export default function LikedVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getLikedVideos();
        setVideos(data?.data || []);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="liked-page" id="liked-videos-page">
      <h1 className="page-title">Liked Videos</h1>
      <p className="page-subtitle">{videos.length} videos you liked</p>

      <VideoGrid videos={videos} loading={loading} />
    </div>
  );
}
