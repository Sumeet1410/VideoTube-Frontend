import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getSubscribedChannels,
  getSubscribers,
  toggleSubscription,
} from '../api';
import Avatar from '../components/UI/Avatar';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import EmptyState from '../components/UI/EmptyState';
import TabBar from '../components/UI/TabBar';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiUsers,
  HiUserGroup,
  HiExternalLink,
  HiSparkles,
} from 'react-icons/hi';
import './SubscriptionsPage.css';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab: 'subscriptions' | 'subscribers'
  const initialTab = searchParams.get('tab') === 'subscribers' ? 'subscribers' : 'subscriptions';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [subscriptions, setSubscriptions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track subscription statuses for instant toggling
  const [subStatus, setSubStatus] = useState({});

  useEffect(() => {
    if (user?._id) {
      loadData();
    }
  }, [user?._id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch channels user is subscribed to
      const [subscribedRes, subscribersRes] = await Promise.allSettled([
        getSubscribedChannels(user._id),
        getSubscribers(user._id),
      ]);

      const subChannels =
        subscribedRes.status === 'fulfilled' ? subscribedRes.value?.data?.data || [] : [];
      const subUsers =
        subscribersRes.status === 'fulfilled' ? subscribersRes.value?.data?.data || [] : [];

      setSubscriptions(subChannels);
      setSubscribers(subUsers);

      // Initial sub status map: all channels in subChannels are subscribed (true)
      const initialMap = {};
      subChannels.forEach((ch) => {
        if (ch?._id) initialMap[ch._id] = true;
      });
      setSubStatus(initialMap);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load subscription data'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (channelId, channelUsername) => {
    const isCurrentlySubbed = !!subStatus[channelId];
    const newStatus = !isCurrentlySubbed;

    // Optimistic UI update
    setSubStatus((prev) => ({
      ...prev,
      [channelId]: newStatus,
    }));

    if (!newStatus) {
      setSubscriptions((prev) => prev.filter((ch) => ch._id !== channelId));
    }

    try {
      const { data } = await toggleSubscription(channelId);
      if (!newStatus) {
        toast.success(`Unsubscribed from @${channelUsername || 'channel'}`);
      } else {
        toast.success(data?.message || `Subscribed to @${channelUsername || 'channel'}`);
      }
    } catch (err) {
      // Revert on failure
      setSubStatus((prev) => ({
        ...prev,
        [channelId]: isCurrentlySubbed,
      }));
      loadData();
      toast.error(getErrorMessage(err, 'Failed to update subscription'));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'subscribers' ? { tab: 'subscribers' } : {});
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="subscriptions-page animate-fade-in" id="subscriptions-page">
      {/* Header */}
      <div className="subscriptions-header">
        <div className="subscriptions-header-text">
          <h1 className="subscriptions-title">
            <HiUserGroup className="header-icon" /> Subscriptions & Community
          </h1>
          <p className="subscriptions-subtitle">
            Manage the creators you follow and see who has subscribed to your channel.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <TabBar
        tabs={[
          { id: 'subscriptions', label: `Subscriptions (${subscriptions.length})`, icon: <HiUsers size={18} />, elementId: 'tab-subscriptions' },
          { id: 'subscribers', label: `Your Subscribers (${subscribers.length})`, icon: <HiUserGroup size={18} />, elementId: 'tab-subscribers' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
        className="subscriptions-tabs"
      />

      {/* Content: Subscriptions (Channels you follow) */}
      {activeTab === 'subscriptions' && (
        <div className="subscriptions-content animate-fade-in">
          {subscriptions.length === 0 ? (
            <EmptyState
              icon={<HiUsers size={52} />}
              title="No subscriptions yet"
              description="When you subscribe to creators, they will appear here so you never miss an upload."
              action={
                <Link to="/">
                  <Button variant="primary" size="md">Explore Creators</Button>
                </Link>
              }
            />
          ) : (
            <div className="sub-cards-grid">
              {subscriptions.map((ch) => (
                <div key={ch._id} className="sub-card glass animate-fade-in-up">
                  <div className="sub-card-header">
                    <Avatar src={ch.avatar} name={ch.username} size={54} />
                    <div className="sub-card-info">
                      <h3 className="sub-card-name">@{ch.username}</h3>
                      <span className="sub-card-handle">Creator</span>
                    </div>
                  </div>

                  <div className="sub-card-actions">
                    <Link to={`/channel/${ch.username}`} className="sub-view-link">
                      <Button variant="secondary" size="sm" icon={<HiExternalLink />}>
                        View Channel
                      </Button>
                    </Link>
                    <Button
                      variant={subStatus[ch._id] ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggle(ch._id, ch.username)}
                      id={`toggle-sub-${ch._id}`}
                    >
                      {subStatus[ch._id] ? 'Subscribed' : 'Subscribe'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content: Subscribers (People following you) */}
      {activeTab === 'subscribers' && (
        <div className="subscriptions-content animate-fade-in">
          {subscribers.length === 0 ? (
            <EmptyState
              icon={<HiSparkles size={52} />}
              title="No subscribers yet"
              description="Upload videos and post community updates to grow your subscriber base!"
              action={
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to="/upload">
                    <Button variant="primary" size="md">Upload Video</Button>
                  </Link>
                  <Link to="/community">
                    <Button variant="secondary" size="md">Post Update</Button>
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="sub-cards-grid">
              {subscribers.map((sub) => {
                const isSubbedToThem = !!subStatus[sub._id];
                return (
                  <div key={sub._id} className="sub-card glass animate-fade-in-up">
                    <div className="sub-card-header">
                      <Avatar src={sub.avatar} name={sub.username} size={54} />
                      <div className="sub-card-info">
                        <h3 className="sub-card-name">@{sub.username}</h3>
                        <span className="sub-card-handle">Subscriber</span>
                      </div>
                    </div>

                    <div className="sub-card-actions">
                      <Link to={`/channel/${sub.username}`} className="sub-view-link">
                        <Button variant="secondary" size="sm" icon={<HiExternalLink />}>
                          View Channel
                        </Button>
                      </Link>
                      {sub._id !== user._id && (
                        <Button
                          variant={isSubbedToThem ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => handleToggle(sub._id, sub.username)}
                          id={`toggle-sub-${sub._id}`}
                        >
                          {isSubbedToThem ? 'Subscribed' : 'Subscribe'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
