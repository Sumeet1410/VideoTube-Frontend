import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
} from '../api';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Loader from '../components/UI/Loader';
import EmptyState from '../components/UI/EmptyState';
import toast from 'react-hot-toast';
import {
  formatDate,
  formatViews,
  formatDuration,
  getErrorMessage,
} from '../utils/helpers';
import {
  HiArrowLeft,
  HiCollection,
  HiPencil,
  HiTrash,
  HiPlay,
} from 'react-icons/hi';
import './PlaylistPage.css';

export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Playlist Modal State (Item 6)
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const { data } = await getPlaylistById(playlistId);
      setPlaylist(data?.data);
      setEditName(data?.data?.name || '');
      setEditDesc(data?.data?.description || '');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Playlist not found'));
    } finally {
      setLoading(false);
    }
  };

  // Item 6: Update playlist name & description
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Playlist name cannot be empty');
      return;
    }
    setUpdating(true);
    try {
      const { data } = await updatePlaylist(playlistId, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setPlaylist((prev) => ({
        ...prev,
        name: data?.data?.name || editName.trim(),
        description: data?.data?.description !== undefined ? data?.data?.description : editDesc.trim(),
      }));
      setShowEdit(false);
      toast.success('Playlist updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update playlist'));
    } finally {
      setUpdating(false);
    }
  };

  // Item 4: Remove video from playlist
  const handleRemoveVideo = async (videoId, videoTitle) => {
    if (!confirm(`Remove "${videoTitle || 'this video'}" from playlist?`)) return;
    try {
      await removeVideoFromPlaylist(playlistId, videoId);
      setPlaylist((prev) => ({
        ...prev,
        videos: (prev.videos || []).filter((v) => (v._id || v) !== videoId),
      }));
      toast.success('Video removed from playlist');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove video'));
    }
  };

  // Delete entire playlist
  const handleDeletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this entire playlist?')) return;
    try {
      await deletePlaylist(playlistId);
      toast.success('Playlist deleted');
      navigate('/playlists');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete playlist'));
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!playlist) {
    return (
      <div className="playlist-empty" style={{ minHeight: '60vh' }}>
        <HiCollection size={54} style={{ opacity: 0.3 }} />
        <h3>Playlist not found</h3>
        <Link to="/playlists" style={{ marginTop: '1rem' }}>
          <Button variant="secondary" size="sm">Back to Playlists</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user && (String(user._id) === String(playlist.owner?._id || playlist.owner));
  const videos = playlist.videos || [];
  const firstVideo = videos[0];
  const firstThumbnail = firstVideo?.thumbnail?.url || firstVideo?.thumbnail;

  return (
    <div className="playlist-page animate-fade-in" id="playlist-detail-page">
      <Link to="/playlists" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        <HiArrowLeft size={18} /> Back to playlists
      </Link>

      {/* Hero Header Card */}
      <div className="playlist-hero glass animate-fade-in-up">
        <div className="playlist-hero-cover">
          {firstThumbnail ? (
            <img src={firstThumbnail} alt={playlist.name} className="playlist-hero-img" />
          ) : (
            <HiCollection size={48} />
          )}
        </div>

        <div className="playlist-hero-content">
          <div>
            <div className="playlist-hero-header">
              <h1 className="playlist-hero-title">{playlist.name}</h1>
              {isOwner && (
                <div className="playlist-hero-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<HiPencil />}
                    onClick={() => {
                      setEditName(playlist.name);
                      setEditDesc(playlist.description || '');
                      setShowEdit(true);
                    }}
                    id="edit-playlist-btn"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<HiTrash />}
                    onClick={handleDeletePlaylist}
                    id="delete-playlist-btn"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {playlist.description && (
              <p className="playlist-hero-desc">{playlist.description}</p>
            )}

            <div className="playlist-hero-meta">
              <span>{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
              <span className="dot">•</span>
              <span>Updated {formatDate(playlist.updatedAt || playlist.createdAt)}</span>
            </div>
          </div>

          {videos.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <Link to={`/video/${videos[0]._id}`}>
                <Button variant="primary" size="md" icon={<HiPlay />}>
                  Play All
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Videos List */}
      {videos.length === 0 ? (
        <EmptyState
          icon={<HiCollection size={48} />}
          title="No videos in this playlist"
          description='Browse videos on VideoTube and click the "Save" button below the player to add them here.'
          action={
            <Link to="/">
              <Button variant="primary" size="md">Explore Videos</Button>
            </Link>
          }
          className="animate-fade-in"
        />
      ) : (
        <div className="playlist-videos-table animate-fade-in">
          {videos.map((vid, idx) => {
            const thumb = vid?.thumbnail?.url || vid?.thumbnail;
            const ownerName = vid?.owner?.fullName || vid?.owner?.username || 'Unknown';
            return (
              <div key={vid._id || idx} className="playlist-video-row glass">
                <span className="playlist-row-index">#{idx + 1}</span>

                <Link to={`/video/${vid._id}`} className="playlist-row-thumb-link">
                  {thumb ? (
                    <img src={thumb} alt={vid.title} className="playlist-row-thumb" />
                  ) : (
                    <div className="playlist-row-thumb-placeholder">▶</div>
                  )}
                  {vid.duration && (
                    <span className="playlist-row-duration">{formatDuration(vid.duration)}</span>
                  )}
                </Link>

                <div className="playlist-row-info">
                  <Link to={`/video/${vid._id}`} className="playlist-row-title truncate">
                    {vid.title || 'Untitled Video'}
                  </Link>
                  {vid.owner?.username ? (
                    <Link to={`/channel/${vid.owner.username}`} className="playlist-row-channel">
                      {ownerName}
                    </Link>
                  ) : (
                    <span className="playlist-row-channel">{ownerName}</span>
                  )}
                  <span className="playlist-row-meta">
                    {formatViews(vid.views)} • {formatDate(vid.createdAt)}
                  </span>
                </div>

                {isOwner && (
                  <button
                    className="playlist-row-remove-btn"
                    onClick={() => handleRemoveVideo(vid._id, vid.title)}
                    title="Remove from playlist"
                    id={`remove-video-${vid._id}`}
                  >
                    <HiTrash size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Playlist Modal (Item 6) */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Playlist Details"
      >
        <form onSubmit={handleUpdate} className="create-playlist-form" id="edit-playlist-form">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Playlist Name *
            </label>
            <input
              type="text"
              className="search-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Favorite Coding Tutorials"
              required
              id="edit-playlist-name-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Description
            </label>
            <textarea
              className="search-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Give your playlist a description..."
              rows={4}
              id="edit-playlist-desc-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
            <Button variant="secondary" size="md" type="button" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={updating} id="save-playlist-btn">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
