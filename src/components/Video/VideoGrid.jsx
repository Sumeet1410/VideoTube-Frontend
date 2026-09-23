import VideoCard, { VideoCardSkeleton } from './VideoCard';
import EmptyState from '../UI/EmptyState';
import './VideoGrid.css';

export default function VideoGrid({ videos, loading, skeletonCount = 12 }) {
  if (loading) {
    return (
      <div className="video-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <EmptyState
        icon="📹"
        title="No videos found"
        description="Try adjusting your search or filters"
        className="video-grid-empty"
      />
    );
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}
