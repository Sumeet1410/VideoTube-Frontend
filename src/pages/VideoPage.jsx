import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  HiThumbUp,
  HiOutlineThumbUp,
  HiShare,
  HiFolderAdd,
  HiPlus,
  HiCheck,
} from 'react-icons/hi';
import {
  getVideoById,
  getAllVideos,
  watchVideo,
  toggleVideoLike,
  getVideoLikes,
  getVideoComments,
  addComment,
  deleteComment as deleteCommentApi,
  updateComment as updateCommentApi,
  getChannelProfile,
  toggleSubscription,
  getUserPlaylists,
  addVideoToPlaylist,
  createPlaylist,
  toggleCommentLike,
  getCommentLikes,
} from '../api';
import { useAuth } from '../context/AuthContext';
import { formatViews, formatDate, getErrorMessage } from '../utils/helpers';
import Avatar from '../components/UI/Avatar';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import Modal from '../components/UI/Modal';
import Pagination from '../components/UI/Pagination';
import toast from 'react-hot-toast';
import './VideoPage.css';

export default function VideoPage() {
  const { videoId } = useParams();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  const watchedVideoIdRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [owner, setOwner] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [totalCommentPages, setTotalCommentPages] = useState(1);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [likedComments, setLikedComments] = useState({});
  const [commentLikesCount, setCommentLikesCount] = useState({});
  const [showDescription, setShowDescription] = useState(false);

  // Playlist Modal State
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState({});
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  // Fetch video and resolve owner & channel profile
  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const { data } = await getVideoById(videoId);
        const vid = data?.data;
        setVideo(vid);

        // Resolve owner object
        let resolvedOwner = typeof vid?.owner === 'object' && vid.owner !== null ? vid.owner : null;

        // 1. Check if video object was passed in navigation state
        if (!resolvedOwner && location.state?.video?.owner) {
          const stOwner = location.state.video.owner;
          if (typeof stOwner === 'object') resolvedOwner = stOwner;
        }

        // 2. Fallback: match from all videos list where owner is populated
        if (!resolvedOwner) {
          try {
            const { data: allRes } = await getAllVideos({ limit: 100 });
            const allVideosList = allRes?.data?.videos || [];
            const found = allVideosList.find(
              (v) => v._id === videoId || (typeof v.owner === 'object' && String(v.owner?._id) === String(vid?.owner))
            );
            if (found?.owner && typeof found.owner === 'object') {
              resolvedOwner = found.owner;
            }
          } catch {}
        }

        setOwner(resolvedOwner);

        // Fetch channel profile for subscriber count and subscription status
        if (resolvedOwner?.username) {
          try {
            const { data: chanData } = await getChannelProfile(resolvedOwner.username);
            setChannel(chanData?.data);
            setSubscribed(chanData?.data?.isSubscribed || false);
          } catch {}
        }

        // Record view and check like status
        if (isAuthenticated) {
          if (watchedVideoIdRef.current !== videoId) {
            watchedVideoIdRef.current = videoId;
            try { await watchVideo(videoId); } catch {}
          }
          try {
            const { data: likesRes } = await getVideoLikes(videoId);
            setLiked(Boolean(likesRes?.data?.isLiked));
            setLikesCount(likesRes?.data?.likesCount || 0);
          } catch {}
        }
      } catch (err) {
        toast.error('Failed to load video');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId, isAuthenticated, location.state]);

  // Fetch comments and check liked status
  const fetchComments = useCallback(async (targetPage = commentPage) => {
    setCommentsLoading(true);
    try {
      const { data } = await getVideoComments(videoId, { page: targetPage, limit: 10 });
      const result = data?.data;
      const commentList = result?.data || [];
      setComments(commentList);
      setTotalComments(result?.totalCommentCount || 0);
      setTotalCommentPages(result?.totalPages || 1);

      // Check liked status and likes count for each loaded comment
      if (isAuthenticated && commentList.length > 0) {
        const checks = await Promise.allSettled(
          commentList.map((c) => getCommentLikes(c._id))
        );
        const likedMap = {};
        const countMap = {};
        checks.forEach((res, idx) => {
          if (res.status === 'fulfilled') {
            const resData = res.value?.data?.data;
            likedMap[commentList[idx]._id] = Boolean(resData?.isLiked);
            countMap[commentList[idx]._id] = Number(resData?.likesCount) || 0;
          }
        });
        setLikedComments((prev) => ({ ...prev, ...likedMap }));
        setCommentLikesCount((prev) => ({ ...prev, ...countMap }));
      }
    } catch {}
    setCommentsLoading(false);
  }, [videoId, commentPage, isAuthenticated]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to like'); return; }
    if (likeLoading) return;

    const prevLiked = liked;
    const nextLiked = !prevLiked;

    // Optimistic UI update: toggle immediately
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    setLikeLoading(true);

    try {
      const { data } = await toggleVideoLike(videoId);
      toast.success(data?.message || 'Done');
    } catch (err) {
      // Revert if backend request fails
      setLiked(prevLiked);
      setLikesCount((prev) => (prevLiked ? prev + 1 : Math.max(0, prev - 1)));
      toast.error(getErrorMessage(err, 'Failed to toggle like'));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to subscribe'); return; }
    const channelId = channel?._id || (typeof video?.owner === 'object' ? video.owner._id : video?.owner);
    if (!channelId || subLoading) return;

    const prevSub = subscribed;
    const nextSub = !prevSub;

    // Optimistic UI update: instant 0ms toggle
    setSubscribed(nextSub);
    setChannel((prev) =>
      prev
        ? {
            ...prev,
            subscribersCount: nextSub
              ? (prev.subscribersCount || 0) + 1
              : Math.max(0, (prev.subscribersCount || 1) - 1),
          }
        : prev
    );
    setSubLoading(true);

    try {
      const { data } = await toggleSubscription(channelId);
      toast.success(data?.message || (nextSub ? 'Subscribed' : 'Unsubscribed'));
    } catch (err) {
      // Revert on failure
      setSubscribed(prevSub);
      setChannel((prev) =>
        prev
          ? {
              ...prev,
              subscribersCount: prevSub
                ? (prev.subscribersCount || 0) + 1
                : Math.max(0, (prev.subscribersCount || 1) - 1),
            }
          : prev
      );
      toast.error(getErrorMessage(err, 'Failed to toggle subscription'));
    } finally {
      setSubLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to comment'); return; }
    if (!commentText.trim()) return;
    try {
      await addComment(videoId, commentText.trim());
      setCommentText('');
      toast.success('Comment added');
      setCommentPage(1);
      fetchComments(1);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to add comment'));
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentApi(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setTotalComments((prev) => prev - 1);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete comment'));
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await updateCommentApi(commentId, editText.trim());
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: editText.trim() } : c))
      );
      setEditingComment(null);
      setEditText('');
      toast.success('Comment updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update comment'));
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleToggleCommentLike = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like comments');
      return;
    }
    const prevLiked = Boolean(likedComments[commentId]);
    const nextLiked = !prevLiked;

    setLikedComments((prev) => ({ ...prev, [commentId]: nextLiked }));
    setCommentLikesCount((prev) => ({
      ...prev,
      [commentId]: nextLiked ? (prev[commentId] || 0) + 1 : Math.max(0, (prev[commentId] || 1) - 1),
    }));

    try {
      await toggleCommentLike(commentId);
    } catch (err) {
      setLikedComments((prev) => ({ ...prev, [commentId]: prevLiked }));
      setCommentLikesCount((prev) => ({
        ...prev,
        [commentId]: prevLiked ? (prev[commentId] || 0) + 1 : Math.max(0, (prev[commentId] || 1) - 1),
      }));
      toast.error(getErrorMessage(err, 'Failed to like comment'));
    }
  };

  const handleOpenPlaylistModal = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save to a playlist');
      return;
    }
    setShowPlaylistModal(true);
    setLoadingPlaylists(true);
    try {
      const { data } = await getUserPlaylists(user._id);
      const userPlaylists = data?.data || [];
      setPlaylists(userPlaylists);
      const initialAdded = {};
      userPlaylists.forEach((pl) => {
        if (pl.videos?.some((v) => (v._id || v) === videoId)) {
          initialAdded[pl._id] = true;
        }
      });
      setAddedPlaylists(initialAdded);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load playlists'));
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlistId, playlistName) => {
    try {
      await addVideoToPlaylist(playlistId, videoId);
      setAddedPlaylists((prev) => ({ ...prev, [playlistId]: true }));
      toast.success(`Saved to ${playlistName}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to add video to playlist'));
    }
  };

  const handleCreateAndAddPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    setCreatingPlaylist(true);
    try {
      const { data } = await createPlaylist({ name: newPlaylistName.trim() });
      const created = data?.data;
      if (created?._id) {
        await addVideoToPlaylist(created._id, videoId);
        setPlaylists((prev) => [created, ...prev]);
        setAddedPlaylists((prev) => ({ ...prev, [created._id]: true }));
        toast.success(`Created & added to "${created.name}"`);
        setNewPlaylistName('');
        setShowNewPlaylistInput(false);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create playlist'));
    } finally {
      setCreatingPlaylist(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!video) {
    return (
      <div className="video-page-error">
        <h2>Video not found</h2>
        <Link to="/">Go home</Link>
      </div>
    );
  }

  return (
    <div className="video-page" id="video-page">
      <div className="video-page-main">
        {/* Video Player */}
        <div className="video-player-wrapper">
          {video.videoFile?.url ? (
            <video
              ref={videoRef}
              className="video-player"
              controls
              autoPlay
              src={video.videoFile.url}
              poster={video.thumbnail?.url}
              id="video-player"
            />
          ) : (
            <div className="video-player-placeholder">
              <div className="placeholder-content">
                {video.isPublished === false ? (
                  <>
                    <span className="placeholder-icon">⏳</span>
                    <h3>Video is being processed</h3>
                    <p>This video is still being processed. Check back later.</p>
                  </>
                ) : (
                  <>
                    <span className="placeholder-icon">▶</span>
                    <h3>Video unavailable</h3>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="video-info animate-fade-in-up">
          <h1 className="video-title" id="video-title">{video.title}</h1>

          <div className="video-meta-bar">
            <div className="video-meta-left">
              {owner && (
                <Link to={`/channel/${owner.username}`} className="video-channel">
                  <Avatar src={owner.avatar} name={owner.fullName || owner.username} size={40} />
                  <div className="video-channel-info">
                    <span className="video-channel-name">{owner.fullName || owner.username}</span>
                    <span className="video-channel-subs">
                      {channel?.subscribersCount || 0} subscribers
                    </span>
                  </div>
                </Link>
              )}
              {owner && (
                String(user?._id) === String(owner._id) ? (
                  <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" size="sm">
                      Your Video
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant={subscribed ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={handleSubscribe}
                    disabled={subLoading}
                    id="subscribe-btn"
                  >
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </Button>
                )
              )}
            </div>

            <div className="video-actions">
              <button
                className={`action-btn ${liked ? 'action-active' : ''}`}
                onClick={handleLike}
                disabled={likeLoading}
                id="like-btn"
              >
                {liked ? <HiThumbUp size={20} /> : <HiOutlineThumbUp size={20} />}
                <span>{likesCount > 0 ? likesCount : 'Like'}</span>
              </button>
              <button className="action-btn" onClick={handleShare} id="share-btn">
                <HiShare size={20} />
                <span>Share</span>
              </button>
              <button
                className="action-btn"
                onClick={handleOpenPlaylistModal}
                id="save-playlist-btn"
              >
                <HiFolderAdd size={20} />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="video-description-box" onClick={() => setShowDescription(!showDescription)}>
            <div className="video-stats-row">
              <span>{formatViews(video.views)}</span>
              <span className="dot">•</span>
              <span>{formatDate(video.createdAt)}</span>
            </div>
            <p className={`video-description ${showDescription ? 'expanded' : ''}`}>
              {video.description || 'No description'}
            </p>
            {video.description && video.description.length > 200 && (
              <span className="show-more">{showDescription ? 'Show less' : 'Show more'}</span>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="comments-section" id="comments-section">
          <h3 className="comments-title">{totalComments} Comments</h3>

          {isAuthenticated && (
            <form className="comment-form" onSubmit={handleAddComment} id="comment-form">
              <Avatar src={user?.avatar} name={user?.fullName} size={36} />
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  id="comment-input"
                />
                {commentText.trim() && (
                  <div className="comment-form-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setCommentText('')}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit" id="comment-submit">
                      Comment
                    </Button>
                  </div>
                )}
              </div>
            </form>
          )}

          {commentsLoading ? (
            <div className="comments-loading"><Loader size={30} /></div>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment._id} className="comment-card animate-fade-in" id={`comment-${comment._id}`}>
                  <Link to={comment.owner?.username ? `/channel/${comment.owner.username}` : '#'}>
                    <Avatar
                      src={comment.owner?.avatar}
                      name={comment.owner?.fullName}
                      size={36}
                    />
                  </Link>
                  <div className="comment-body">
                    <div className="comment-header">
                      <Link
                        to={comment.owner?.username ? `/channel/${comment.owner.username}` : '#'}
                        className="comment-author"
                      >
                        {comment.owner?.fullName || 'Unknown'}
                      </Link>
                      <span className="comment-date">{formatDate(comment.createdAt)}</span>
                    </div>

                    {editingComment === comment._id ? (
                      <div className="comment-edit">
                        <input
                          type="text"
                          className="comment-edit-input"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                        <div className="comment-edit-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingComment(null); setEditText(''); }}
                          >
                            Cancel
                          </Button>
                          <Button variant="primary" size="sm" onClick={() => handleUpdateComment(comment._id)}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-content">{comment.content}</p>
                    )}

                    <div className="comment-actions">
                      <button
                        className={`comment-like-btn ${likedComments[comment._id] ? 'liked' : ''}`}
                        onClick={() => handleToggleCommentLike(comment._id)}
                        title="Like comment"
                      >
                        {likedComments[comment._id] ? <HiThumbUp size={15} /> : <HiOutlineThumbUp size={15} />}
                        <span>{(commentLikesCount[comment._id] || 0) > 0 ? commentLikesCount[comment._id] : 'Like'}</span>
                      </button>

                      {user?._id === comment.owner?._id && editingComment !== comment._id && (
                        <>
                          <button
                            className="comment-action-btn"
                            onClick={() => {
                              setEditingComment(comment._id);
                              setEditText(comment.content);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="comment-action-btn comment-action-delete"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Pagination
            currentPage={commentPage}
            totalPages={totalCommentPages}
            onPageChange={setCommentPage}
            className="comments-pagination"
          />
        </div>
      </div>

      {/* Save to Playlist Modal */}
      <Modal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        title="Save to playlist"
        maxWidth={420}
      >
        {loadingPlaylists ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
            <Loader />
          </div>
        ) : (
          <div className="playlist-modal-body">
            <div className="playlist-modal-list">
              {playlists.length === 0 ? (
                <p className="playlist-modal-empty">You haven't created any playlists yet.</p>
              ) : (
                playlists.map((pl) => (
                  <div key={pl._id} className="playlist-modal-item">
                    <div className="playlist-item-info">
                      <span className="playlist-item-name">{pl.name}</span>
                      <span className="playlist-item-count">{pl.videos?.length || 0} videos</span>
                    </div>
                    {addedPlaylists[pl._id] ? (
                      <span className="playlist-added-badge">
                        <HiCheck size={16} /> Added
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddToPlaylist(pl._id, pl.name)}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>

            {!showNewPlaylistInput ? (
              <button
                type="button"
                className="playlist-modal-new-btn"
                onClick={() => setShowNewPlaylistInput(true)}
              >
                <HiPlus size={18} /> Create new playlist
              </button>
            ) : (
              <form onSubmit={handleCreateAndAddPlaylist} className="playlist-modal-new-form">
                <input
                  type="text"
                  placeholder="Playlist title..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="form-input"
                  autoFocus
                />
                <div className="playlist-modal-new-actions">
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => setShowNewPlaylistInput(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    type="submit"
                    loading={creatingPlaylist}
                    disabled={!newPlaylistName.trim()}
                  >
                    Create & Add
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
