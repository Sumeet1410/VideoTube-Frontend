import { Link } from 'react-router-dom';
import { formatViews, formatDate, formatDuration } from '../../utils/helpers';
import Avatar from '../UI/Avatar';
import './VideoCard.css';

export default function VideoCard({ video }) {
  const owner = video?.owner;
  const thumbnail = video?.thumbnail?.url;
  const channelName = owner?.fullName || owner?.username || 'Unknown';
  const username = owner?.username;

  return (
    <div className="video-card animate-fade-in-up" id={`video-card-${video?._id}`}>
      <Link to={`/video/${video?._id}`} state={{ video }} className="video-card-thumbnail-link">
        <div className="video-card-thumbnail">
          {thumbnail ? (
            <img src={thumbnail} alt={video?.title} loading="lazy" />
          ) : (
            <div className="video-card-thumbnail-placeholder">
              <span>▶</span>
            </div>
          )}
          {video?.duration && (
            <span className="video-card-duration">{formatDuration(video.duration)}</span>
          )}
          {video?.isPublished === false && (
            <span className="video-card-badge processing">Processing</span>
          )}
        </div>
      </Link>

      <div className="video-card-info">
        {username && (
          <Link to={`/channel/${username}`} className="video-card-avatar-link">
            <Avatar src={owner?.avatar} name={channelName} size={36} />
          </Link>
        )}
        <div className="video-card-meta">
          <Link to={`/video/${video?._id}`} state={{ video }} className="video-card-title truncate-2">
            {video?.title || 'Untitled'}
          </Link>
          {username && (
            <Link to={`/channel/${username}`} className="video-card-channel truncate">
              {channelName}
            </Link>
          )}
          <div className="video-card-stats">
            <span>{formatViews(video?.views)}</span>
            <span className="dot">•</span>
            <span>{formatDate(video?.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="video-card">
      <div className="video-card-thumbnail skeleton" style={{ aspectRatio: '16/9' }} />
      <div className="video-card-info">
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
        <div className="video-card-meta">
          <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 4 }} />
          <div className="skeleton" style={{ height: 12, width: '60%' }} />
        </div>
      </div>
    </div>
  );
}
