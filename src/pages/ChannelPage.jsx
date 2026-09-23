import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  getChannelProfile,
  toggleSubscription,
  getUserVideos,
  getUserTweets,
  createTweet,
  updateTweet,
  deleteTweet,
  toggleTweetLike,
  getTweetLikes,
} from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDate, getErrorMessage } from '../utils/helpers';
import Avatar from '../components/UI/Avatar';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import Pagination from '../components/UI/Pagination';
import EmptyState from '../components/UI/EmptyState';
import TabBar from '../components/UI/TabBar';
import VideoGrid from '../components/Video/VideoGrid';
import TweetCard from '../components/Tweet';
import toast from 'react-hot-toast';
import {
  HiChatAlt2,
  HiFilm,
} from 'react-icons/hi';
import './ChannelPage.css';

export default function ChannelPage() {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);

  // Tabs: 'videos' | 'tweets'
  const initialTab =
    searchParams.get('tab') === 'community' || searchParams.get('tab') === 'tweets'
      ? 'tweets'
      : 'videos';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Tweets / Community State
  const [tweets, setTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [tweetText, setTweetText] = useState('');
  const [postingTweet, setPostingTweet] = useState(false);
  const [likedTweets, setLikedTweets] = useState({});
  const [tweetLikesCount, setTweetLikesCount] = useState({});

  useEffect(() => {
    const fetchChannel = async () => {
      setLoading(true);
      try {
        const { data } = await getChannelProfile(username);
        setChannel(data?.data);
        setSubscribed(data?.data?.isSubscribed || false);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Channel not found'));
      } finally {
        setLoading(false);
      }
    };
    fetchChannel();
  }, [username]);

  useEffect(() => {
    const fetchVideos = async () => {
      setVideosLoading(true);
      try {
        const { data } = await getUserVideos({
          username,
          page,
          limit: 12,
          sortBy: 'createdAt',
          sortType: 'desc',
        });
        setVideos(data?.data?.videos || []);
        setTotalVideos(data?.data?.totalVideoCount || 0);
      } catch {}
      setVideosLoading(false);
    };
    if (username) fetchVideos();
  }, [username, page]);

  // Fetch tweets when community tab is opened
  useEffect(() => {
    if (activeTab === 'tweets' && channel?._id) {
      fetchTweets();
    }
  }, [activeTab, channel?._id]);

  const fetchTweets = async () => {
    if (!channel?._id) return;
    setTweetsLoading(true);
    try {
      const { data } = await getUserTweets(channel._id);
      const fetched = data?.data || [];
      const sorted = [...fetched].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTweets(sorted);

      if (isAuthenticated && sorted.length > 0) {
        const checks = await Promise.allSettled(sorted.map((t) => getTweetLikes(t._id)));
        const likedMap = {};
        const countMap = {};
        checks.forEach((res, idx) => {
          if (res.status === 'fulfilled') {
            const resData = res.value?.data?.data;
            likedMap[sorted[idx]._id] = Boolean(resData?.isLiked);
            countMap[sorted[idx]._id] = Number(resData?.likesCount) || 0;
          }
        });
        setLikedTweets((prev) => ({ ...prev, ...likedMap }));
        setTweetLikesCount((prev) => ({ ...prev, ...countMap }));
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load posts'));
    } finally {
      setTweetsLoading(false);
    }
  };

  const handlePostTweet = async (e) => {
    e.preventDefault();
    if (!tweetText.trim()) return;
    setPostingTweet(true);
    try {
      const { data } = await createTweet(tweetText.trim());
      setTweets((prev) => [data?.data, ...prev]);
      setTweetText('');
      toast.success('Post published!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to post'));
    } finally {
      setPostingTweet(false);
    }
  };

  const handleUpdateTweet = async (tweetId, updatedContent) => {
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

  const handleDeleteTweet = async (tweetId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteTweet(tweetId);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete post'));
    }
  };

  const handleToggleTweetLike = async (tweetId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like');
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

  const handleSubscribe = async () => {
    if (!isAuthenticated) { toast.error('Please sign in'); return; }
    if (!channel?._id || subLoading) return;

    const prevSub = subscribed;
    const nextSub = !prevSub;

    // Optimistic UI update: instant 0ms toggle
    setSubscribed(nextSub);
    setChannel((prev) => ({
      ...prev,
      subscribersCount: nextSub
        ? (prev.subscribersCount || 0) + 1
        : Math.max(0, (prev.subscribersCount || 1) - 1),
    }));
    setSubLoading(true);

    try {
      const { data } = await toggleSubscription(channel._id);
      toast.success(data?.message || (nextSub ? 'Subscribed' : 'Unsubscribed'));
    } catch (err) {
      // Revert on failure
      setSubscribed(prevSub);
      setChannel((prev) => ({
        ...prev,
        subscribersCount: prevSub
          ? (prev.subscribersCount || 0) + 1
          : Math.max(0, (prev.subscribersCount || 1) - 1),
      }));
      toast.error(getErrorMessage(err, 'Failed to update subscription'));
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!channel) {
    return (
      <div className="channel-not-found">
        <h2>Channel not found</h2>
      </div>
    );
  }

  const isOwner =
    user &&
    (String(user._id) === String(channel._id) ||
      user.username?.toLowerCase() === channel.username?.toLowerCase());
  const totalPages = Math.ceil(totalVideos / 12);

  return (
    <div className="channel-page" id="channel-page">
      {/* Banner */}
      <div className="channel-banner">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="Channel cover" className="channel-banner-img" />
        ) : (
          <div className="channel-banner-gradient" />
        )}
      </div>

      {/* Profile */}
      <div className="channel-profile animate-fade-in-up">
        <Avatar src={channel.avatar} name={channel.fullName} size={80} className="channel-avatar" />
        <div className="channel-info">
          <h1 className="channel-name">{channel.fullName}</h1>
          <div className="channel-meta">
            <span className="channel-username">@{channel.username}</span>
            <span className="dot">•</span>
            {isOwner ? (
              <Link to="/subscriptions?tab=subscribers" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px dashed var(--text-muted)' }} title="View your subscribers">
                {channel.subscribersCount || 0} subscribers
              </Link>
            ) : (
              <span>{channel.subscribersCount || 0} subscribers</span>
            )}
            <span className="dot">•</span>
            <span>{totalVideos} videos</span>
          </div>
        </div>
        {isOwner ? (
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="md">
              Manage Channel
            </Button>
          </Link>
        ) : (
          <Button
            variant={subscribed ? 'secondary' : 'primary'}
            size="md"
            onClick={handleSubscribe}
            disabled={subLoading}
            id="channel-subscribe-btn"
          >
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <TabBar
        tabs={[
          { id: 'videos', label: `Videos (${totalVideos})`, icon: <HiFilm size={18} />, elementId: 'channel-tab-videos' },
          { id: 'tweets', label: 'Community', icon: <HiChatAlt2 size={18} />, elementId: 'channel-tab-community' },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => {
          setActiveTab(tabId);
          setSearchParams(tabId === 'tweets' ? { tab: 'community' } : {});
        }}
        className="channel-tabs"
      />

      {/* Videos Tab Content */}
      {activeTab === 'videos' && (
        <div className="channel-videos-section">
          <VideoGrid videos={videos} loading={videosLoading} />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            style={{ marginTop: '2rem' }}
          />
        </div>
      )}

      {/* Community / Tweets Tab Content */}
      {activeTab === 'tweets' && (
        <div className="channel-community-section animate-fade-in">
          {/* Creator Post Composer */}
          {isOwner && (
            <div className="tweet-composer glass">
              <Avatar src={user?.avatar} name={user?.fullName} size={42} />
              <div className="tweet-composer-body">
                <textarea
                  className="tweet-composer-textarea"
                  placeholder="Share an update, question, or thought with your subscribers..."
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  rows={3}
                />
                <div className="tweet-composer-footer">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handlePostTweet}
                    loading={postingTweet}
                    disabled={!tweetText.trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tweets Feed */}
          {tweetsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader />
            </div>
          ) : tweets.length === 0 ? (
            <EmptyState
              icon={<HiChatAlt2 size={48} />}
              title="No community posts yet"
              description={`When ${isOwner ? 'you post' : `@${channel.username} posts`} updates, they will show up here.`}
            />
          ) : (
            <div className="tweets-list">
              {tweets.map((t) => (
                <TweetCard
                  key={t._id}
                  tweet={t}
                  author={channel}
                  isOwner={isOwner}
                  isLiked={Boolean(likedTweets[t._id])}
                  likesCount={tweetLikesCount[t._id] || 0}
                  onToggleLike={handleToggleTweetLike}
                  onUpdate={handleUpdateTweet}
                  onDelete={handleDeleteTweet}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

