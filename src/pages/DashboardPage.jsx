import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getChannelStats,
  getChannelVideos,
  deleteVideo,
  togglePublishStatus,
  updateVideo,
  getUserTweets,
  createTweet,
  updateTweet,
  deleteTweet,
  toggleTweetLike,
  getTweetLikes,
} from '../api';
import { formatViews, formatDate, getErrorMessage } from '../utils/helpers';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import Modal from '../components/UI/Modal';
import Pagination from '../components/UI/Pagination';
import EmptyState from '../components/UI/EmptyState';
import TabBar from '../components/UI/TabBar';
import TweetCard from '../components/Tweet';
import toast from 'react-hot-toast';
import {
  HiEye,
  HiThumbUp,
  HiUsers,
  HiFilm,
  HiTrash,
  HiEyeOff,
  HiPencil,
  HiUpload,
  HiPhotograph,
  HiChatAlt2,
} from 'react-icons/hi';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);

  // Edit Video Modal state
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editThumbnailFile, setEditThumbnailFile] = useState(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState('');
  const [savingVideo, setSavingVideo] = useState(false);

  // Content Tab: 'videos' | 'tweets'
  const [contentTab, setContentTab] = useState('videos');

  // Community Posts state
  const [tweets, setTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [likedTweets, setLikedTweets] = useState({});
  const [tweetLikesCount, setTweetLikesCount] = useState({});
  const [showCreateTweetModal, setShowCreateTweetModal] = useState(false);
  const [newTweetContent, setNewTweetContent] = useState('');
  const [creatingTweet, setCreatingTweet] = useState(false);
  const [editingTweet, setEditingTweet] = useState(null);
  const [editTweetContent, setEditTweetContent] = useState('');
  const [savingTweet, setSavingTweet] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getChannelStats(user._id);
        setStats(data?.data);
      } catch {}
      setLoading(false);
    };
    if (user?._id) fetchStats();
  }, [user?._id]);

  useEffect(() => {
    const fetchVideos = async () => {
      setVideosLoading(true);
      try {
        const { data } = await getChannelVideos(user._id, {
          page,
          limit: 10,
          sortBy: 'createdAt',
          sortType: 'desc',
        });
        setVideos(data?.data?.videos || []);
        setTotalVideos(data?.data?.totalVideoCount || 0);
      } catch {}
      setVideosLoading(false);
    };
    if (user?._id) fetchVideos();
  }, [user?._id, page]);

  const fetchUserTweets = async () => {
    if (!user?._id) return;
    setTweetsLoading(true);
    try {
      const { data } = await getUserTweets(user._id);
      const fetched = data?.data || [];
      const sorted = [...fetched].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTweets(sorted);

      if (sorted.length > 0) {
        const checks = await Promise.allSettled(sorted.map((t) => getTweetLikes(t._id)));
        const countMap = {};
        const likedMap = {};
        checks.forEach((res, idx) => {
          if (res.status === 'fulfilled') {
            countMap[sorted[idx]._id] = Number(res.value?.data?.data?.likesCount) || 0;
            likedMap[sorted[idx]._id] = Boolean(res.value?.data?.data?.isLiked);
          }
        });
        setTweetLikesCount(countMap);
        setLikedTweets(likedMap);
      }
    } catch {
      toast.error('Failed to load community posts');
    } finally {
      setTweetsLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id && contentTab === 'tweets') {
      fetchUserTweets();
    }
  }, [user?._id, contentTab]);

  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!newTweetContent.trim()) return;
    setCreatingTweet(true);
    try {
      const { data } = await createTweet(newTweetContent.trim());
      const newPost = data?.data;
      if (newPost) {
        setTweets((prev) => [newPost, ...prev]);
        setTweetLikesCount((prev) => ({ ...prev, [newPost._id]: 0 }));
      }
      setNewTweetContent('');
      setShowCreateTweetModal(false);
      toast.success('Community post created!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create post'));
    } finally {
      setCreatingTweet(false);
    }
  };

  const handleOpenEditTweetModal = (tweet) => {
    setEditingTweet(tweet);
    setEditTweetContent(tweet.content || '');
  };

  const handleCloseEditTweetModal = () => {
    setEditingTweet(null);
    setEditTweetContent('');
  };

  const handleUpdateTweet = async (e) => {
    e.preventDefault();
    if (!editingTweet || !editTweetContent.trim()) return;
    setSavingTweet(true);
    try {
      await updateTweet(editingTweet._id, editTweetContent.trim());
      setTweets((prev) =>
        prev.map((t) => (t._id === editingTweet._id ? { ...t, content: editTweetContent.trim() } : t))
      );
      handleCloseEditTweetModal();
      toast.success('Community post updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update post'));
    } finally {
      setSavingTweet(false);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (!confirm('Are you sure you want to delete this community post?')) return;
    try {
      await deleteTweet(tweetId);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      toast.success('Community post deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete post'));
    }
  };

  const handleToggleTweetLike = async (tweetId) => {
    const prevLiked = Boolean(likedTweets[tweetId]);
    const nextLiked = !prevLiked;

    setLikedTweets((prev) => ({ ...prev, [tweetId]: nextLiked }));
    setTweetLikesCount((prev) => ({
      ...prev,
      [tweetId]: nextLiked ? (prev[tweetId] || 0) + 1 : Math.max(0, (prev[tweetId] || 1) - 1),
    }));

    try {
      await toggleTweetLike(tweetId);
    } catch (err) {
      setLikedTweets((prev) => ({ ...prev, [tweetId]: prevLiked }));
      setTweetLikesCount((prev) => ({
        ...prev,
        [tweetId]: prevLiked ? (prev[tweetId] || 0) + 1 : Math.max(0, (prev[tweetId] || 1) - 1),
      }));
      toast.error(getErrorMessage(err, 'Failed to like post'));
    }
  };

  const handleDelete = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      setTotalVideos((prev) => prev - 1);
      toast.success('Video deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleTogglePublish = async (videoId) => {
    try {
      const { data } = await togglePublishStatus(videoId);
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, isPublic: !v.isPublic } : v
        )
      );
      toast.success(data?.message || 'Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleOpenEditModal = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title || '');
    setEditDescription(video.description || '');
    setEditThumbnailFile(null);
    setEditThumbnailPreview(video.thumbnail?.url || '');
  };

  const handleCloseEditModal = () => {
    setEditingVideo(null);
    setEditTitle('');
    setEditDescription('');
    setEditThumbnailFile(null);
    setEditThumbnailPreview('');
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditThumbnailFile(file);
      setEditThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingVideo) return;
    if (!editTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    setSavingVideo(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('description', editDescription.trim());
      if (editThumbnailFile) {
        formData.append('thumbnail', editThumbnailFile);
      }

      const { data } = await updateVideo(editingVideo._id, formData);
      const updated = data?.data;

      setVideos((prev) =>
        prev.map((v) =>
          v._id === editingVideo._id
            ? {
                ...v,
                title: updated?.title || editTitle.trim(),
                description: updated?.description || editDescription.trim(),
                thumbnail: updated?.thumbnail || v.thumbnail,
              }
            : v
        )
      );
      toast.success('Video updated successfully');
      handleCloseEditModal();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update video'));
    } finally {
      setSavingVideo(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const totalPages = Math.ceil(totalVideos / 10);

  const statCards = [
    { label: 'Total Views', value: stats?.totalViews || 0, icon: <HiEye size={24} />, color: '#3b82f6' },
    { label: 'Subscribers', value: stats?.subscriberCount || 0, icon: <HiUsers size={24} />, color: '#e94560', link: '/subscriptions?tab=subscribers' },
    { label: 'Total Videos', value: stats?.totalVideos || 0, icon: <HiFilm size={24} />, color: '#8b5cf6' },
    { label: 'Total Likes', value: stats?.totalLikes || 0, icon: <HiThumbUp size={24} />, color: '#10b981' },
  ];

  return (
    <div className="dashboard-page" id="dashboard-page">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Welcome back, {user?.fullName}</p>

      {/* Stats Cards */}
      <div className="stats-grid animate-fade-in-up">
        {statCards.map((card) => {
          const content = (
            <div
              className="stat-card glass"
              style={{ '--stat-color': card.color, cursor: card.link ? 'pointer' : 'default' }}
            >
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-info">
                <span className="stat-value">{card.value.toLocaleString()}</span>
                <span className="stat-label">{card.label}</span>
              </div>
            </div>
          );
          return card.link ? (
            <Link key={card.label} to={card.link} style={{ textDecoration: 'none', color: 'inherit' }}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* Content Management Section */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <TabBar
            tabs={[
              { id: 'videos', label: `Videos (${totalVideos})`, icon: <HiFilm size={18} />, elementId: 'tab-videos' },
              { id: 'tweets', label: `Community Posts ${tweets.length > 0 ? `(${tweets.length})` : ''}`, icon: <HiChatAlt2 size={18} />, elementId: 'tab-community-posts' },
            ]}
            activeTab={contentTab}
            onChange={setContentTab}
            className="dashboard-content-tabs"
            style={{ borderBottom: 'none', marginBottom: 0 }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {contentTab === 'videos' ? (
              <Link to="/upload">
                <Button variant="primary" size="sm">Upload Video</Button>
              </Link>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setShowCreateTweetModal(true)}>
                Create Post
              </Button>
            )}
          </div>
        </div>

        {contentTab === 'videos' && (
          <>
            {videosLoading ? (
              <Loader size={30} />
            ) : videos.length === 0 ? (
              <EmptyState
                icon={<HiFilm size={48} />}
                title="No videos yet"
                description="Upload your first video to start growing your channel!"
                action={
                  <Link to="/upload">
                    <Button variant="primary" size="sm">Upload Video</Button>
                  </Link>
                }
              />
            ) : (
              <div className="videos-table-wrapper">
                <table className="videos-table" id="videos-table">
                  <thead>
                    <tr>
                      <th>Video</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((video) => (
                      <tr key={video._id} className="animate-fade-in">
                        <td>
                          <Link to={`/video/${video._id}`} className="video-table-info">
                            <div className="video-table-thumb">
                              {video.thumbnail?.url ? (
                                <img src={video.thumbnail.url} alt={video.title} />
                              ) : (
                                <div className="thumb-placeholder">▶</div>
                              )}
                            </div>
                            <div className="video-table-meta">
                              <span className="video-table-title truncate">{video.title}</span>
                              <span className="video-table-desc truncate">{video.description}</span>
                            </div>
                          </Link>
                        </td>
                        <td>
                          <span className={`status-badge ${video.isPublic ? 'public' : 'private'}`}>
                            {video.isPublished === false ? 'Processing' : video.isPublic ? 'Public' : 'Private'}
                          </span>
                        </td>
                        <td className="table-views">{video.views || 0}</td>
                        <td className="table-date">{formatDate(video.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="table-action-btn edit"
                              title="Edit video details"
                              onClick={() => handleOpenEditModal(video)}
                              id={`edit-video-${video._id}`}
                            >
                              <HiPencil size={16} />
                            </button>
                            <button
                              className="table-action-btn"
                              title={video.isPublic ? 'Make private' : 'Make public'}
                              onClick={() => handleTogglePublish(video._id)}
                              id={`toggle-publish-${video._id}`}
                            >
                              {video.isPublic ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                            </button>
                            <button
                              className="table-action-btn delete"
                              title="Delete video"
                              onClick={() => handleDelete(video._id)}
                              id={`delete-video-${video._id}`}
                            >
                              <HiTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              style={{ marginTop: '1.5rem' }}
            />
          </>
        )}

        {/* Community Posts Table */}
        {contentTab === 'tweets' && (
          tweetsLoading ? (
            <Loader size={30} />
          ) : tweets.length === 0 ? (
            <EmptyState
              icon={<HiChatAlt2 size={48} />}
              title="No community posts yet"
              description="You haven't posted any community updates yet."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateTweetModal(true)}
                >
                  Create Your First Post
                </Button>
              }
            />
          ) : (
            <div className="dashboard-tweets-list">
              {tweets.map((t) => (
                <TweetCard
                  key={t._id}
                  tweet={t}
                  author={user}
                  isOwner={true}
                  isLiked={Boolean(likedTweets[t._id])}
                  likesCount={tweetLikesCount[t._id] || 0}
                  onToggleLike={handleToggleTweetLike}
                  onEdit={handleOpenEditTweetModal}
                  onDelete={handleDeleteTweet}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Edit Video Modal */}
      <Modal
        isOpen={Boolean(editingVideo)}
        onClose={handleCloseEditModal}
        title="Edit Video"
        maxWidth={540}
      >
        <form onSubmit={handleSaveEdit} className="edit-video-form">
          <div className="edit-form-group">
            <label className="edit-form-label" htmlFor="edit-title-input">
              Title <span className="required">*</span>
            </label>
            <input
              id="edit-title-input"
              type="text"
              className="edit-form-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Video title"
              required
              autoFocus
            />
          </div>

          <div className="edit-form-group">
            <label className="edit-form-label" htmlFor="edit-desc-input">
              Description
            </label>
            <textarea
              id="edit-desc-input"
              className="edit-form-textarea"
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Tell viewers about your video"
            />
          </div>

          <div className="edit-form-group">
            <label className="edit-form-label">Thumbnail</label>
            <div className="edit-thumb-container">
              <div className="edit-thumb-preview-box">
                {editThumbnailPreview ? (
                  <>
                    <img
                      src={editThumbnailPreview}
                      alt="Thumbnail preview"
                      className="edit-thumb-img"
                    />
                    <label
                      className="edit-thumb-change-overlay"
                      htmlFor="edit-thumb-file-input"
                    >
                      <HiUpload size={22} />
                      <span>Change Thumbnail</span>
                    </label>
                  </>
                ) : (
                  <label
                    className="edit-thumb-empty-dropzone"
                    htmlFor="edit-thumb-file-input"
                  >
                    <HiPhotograph size={36} />
                    <span>Upload Thumbnail</span>
                  </label>
                )}
                <input
                  id="edit-thumb-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  style={{ display: 'none' }}
                />
              </div>
              <span className="edit-thumb-note">
                16:9 ratio recommended (JPG, PNG, WebP)
              </span>
            </div>
          </div>

          <div className="edit-video-actions">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCloseEditModal}
              disabled={savingVideo}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={savingVideo}
              id="save-video-btn"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Community Post Modal */}
      <Modal
        isOpen={showCreateTweetModal}
        onClose={() => { if (!creatingTweet) setShowCreateTweetModal(false); }}
        title="Create Community Post"
        maxWidth={500}
      >
        <form onSubmit={handleCreateTweet}>
          <textarea
            className="tweet-modal-textarea"
            placeholder="Share an update, announcement, or thought with your subscribers..."
            value={newTweetContent}
            onChange={(e) => setNewTweetContent(e.target.value)}
            disabled={creatingTweet}
            autoFocus
          />
          <div className="edit-video-actions">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowCreateTweetModal(false)}
              disabled={creatingTweet}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={creatingTweet}
              disabled={!newTweetContent.trim()}
            >
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Community Post Modal */}
      <Modal
        isOpen={Boolean(editingTweet)}
        onClose={handleCloseEditTweetModal}
        title="Edit Community Post"
        maxWidth={500}
      >
        <form onSubmit={handleUpdateTweet}>
          <textarea
            className="tweet-modal-textarea"
            placeholder="Edit your post content..."
            value={editTweetContent}
            onChange={(e) => setEditTweetContent(e.target.value)}
            disabled={savingTweet}
            autoFocus
          />
          <div className="edit-video-actions">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCloseEditTweetModal}
              disabled={savingTweet}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={savingTweet}
              disabled={!editTweetContent.trim()}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
