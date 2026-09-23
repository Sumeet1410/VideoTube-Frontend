import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getUserTweets,
  createTweet,
  updateTweet,
  deleteTweet,
  toggleTweetLike,
  getTweetLikes,
  getSubscribedChannels,
} from '../api';
import Avatar from '../components/UI/Avatar';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import EmptyState from '../components/UI/EmptyState';
import TweetCard from '../components/Tweet';
import { formatDate, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiChatAlt2,
  HiOutlinePaperAirplane,
  HiUserGroup,
  HiSparkles,
} from 'react-icons/hi';
import './CommunityPage.css';

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState('');
  const [likedTweets, setLikedTweets] = useState({});
  const [tweetLikesCount, setTweetLikesCount] = useState({});

  useEffect(() => {
    loadCommunityFeed();
  }, [user?._id, isAuthenticated]);

  const loadCommunityFeed = async () => {
    if (!isAuthenticated || !user?._id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch current user's tweets
      const myRes = await getUserTweets(user._id);
      let allFeed = (myRes?.data?.data || []).map((t) => ({
        ...t,
        author: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          avatar: user.avatar,
        },
      }));

      // 2. Fetch subscribed channels' tweets
      try {
        const subRes = await getSubscribedChannels(user._id);
        const channels = subRes?.data?.data || [];
        const channelTweetPromises = channels.slice(0, 5).map(async (ch) => {
          try {
            const tRes = await getUserTweets(ch._id);
            return (tRes?.data?.data || []).map((t) => ({
              ...t,
              author: {
                _id: ch._id,
                fullName: ch.fullName || ch.username,
                username: ch.username,
                avatar: ch.avatar,
              },
            }));
          } catch {
            return [];
          }
        });

        const subTweetArrays = await Promise.all(channelTweetPromises);
        subTweetArrays.forEach((arr) => {
          allFeed = allFeed.concat(arr);
        });
      } catch {}

      // Sort newest first
      allFeed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTweets(allFeed);

      if (isAuthenticated && allFeed.length > 0) {
        const checks = await Promise.allSettled(allFeed.map((t) => getTweetLikes(t._id)));
        const likedMap = {};
        const countMap = {};
        checks.forEach((res, idx) => {
          if (res.status === 'fulfilled') {
            const resData = res.value?.data?.data;
            likedMap[allFeed[idx]._id] = Boolean(resData?.isLiked);
            countMap[allFeed[idx]._id] = Number(resData?.likesCount) || 0;
          }
        });
        setLikedTweets((prev) => ({ ...prev, ...likedMap }));
        setTweetLikesCount((prev) => ({ ...prev, ...countMap }));
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load community feed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const { data } = await createTweet(content.trim());
      const newPost = {
        ...data?.data,
        author: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          avatar: user.avatar,
        },
      };
      setTweets((prev) => [newPost, ...prev]);
      setContent('');
      toast.success('Post published!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to publish post'));
    } finally {
      setPosting(false);
    }
  };

  const handleUpdate = async (tweetId, updatedContent) => {
    try {
      await updateTweet(tweetId, updatedContent);
      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? { ...t, content: updatedContent } : t))
      );
      toast.success('Post updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update post'));
      throw err;
    }
  };

  const handleDelete = async (tweetId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteTweet(tweetId);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete post'));
    }
  };

  const handleToggleLike = async (tweetId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like posts');
      return;
    }
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

  return (
    <div className="community-page animate-fade-in" id="community-page">
      {/* Header */}
      <div className="community-header">
        <div className="community-header-text">
          <h1 className="community-title">
            <HiChatAlt2 className="community-icon" /> Community & Tweets
          </h1>
          <p className="community-subtitle">
            Updates, announcements, and thoughts from you and creators you follow.
          </p>
        </div>
      </div>

      {/* Post Composer */}
      {isAuthenticated ? (
        <form className="community-composer glass" onSubmit={handleCreateTweet} id="community-composer">
          <div className="community-composer-header">
            <Avatar src={user?.avatar} name={user?.fullName} size={44} />
            <div className="community-composer-user">
              <span className="community-composer-name">{user?.fullName}</span>
              <span className="community-composer-handle">@{user?.username}</span>
            </div>
          </div>
          <textarea
            className="community-composer-input"
            placeholder="Share an update, ask a question, or post a thought..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={500}
            id="tweet-content-input"
          />
          <div className="community-composer-actions">
            <span className="char-count">{500 - content.length} left</span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={posting}
              disabled={!content.trim()}
              id="post-tweet-btn"
            >
              <HiOutlinePaperAirplane size={16} style={{ transform: 'rotate(90deg)' }} />
              <span>Post Tweet</span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="community-auth-prompt glass">
          <HiSparkles size={36} className="auth-prompt-icon" />
          <div className="auth-prompt-content">
            <h3>Join the Conversation</h3>
            <p>Sign in to share tweets, community posts, and like updates from creators.</p>
          </div>
          <Link to="/login">
            <Button variant="primary" size="md">Sign in</Button>
          </Link>
        </div>
      )}

      {/* Feed */}
      <div className="community-feed">
        {loading ? (
          <div className="community-loading">
            <Loader />
          </div>
        ) : tweets.length === 0 ? (
          <EmptyState
            icon={<HiUserGroup size={52} />}
            title="No community posts yet"
            description={
              isAuthenticated
                ? 'Be the first to share an update using the box above!'
                : 'Sign in to see posts and start sharing updates.'
            }
          />
        ) : (
          <div className="community-feed-list">
            {tweets.map((t) => (
              <TweetCard
                key={t._id}
                tweet={t}
                isLiked={Boolean(likedTweets[t._id])}
                likesCount={tweetLikesCount[t._id] || 0}
                onToggleLike={handleToggleLike}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
