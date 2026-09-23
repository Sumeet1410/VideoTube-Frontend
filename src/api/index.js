import API from './axios';

// ── Auth ──
export const registerUser = (formData) =>
  API.post('/users/register', formData);

export const loginUser = (credentials) =>
  API.post('/users/login', credentials);

export const logoutUser = () =>
  API.post('/users/logout');

export const refreshToken = () =>
  API.post('/users/refresh-token');

export const getCurrentUser = () =>
  API.get('/users/current-user');

export const changePassword = (data) =>
  API.post('/users/change-password', data);

export const updateAccount = (data) =>
  API.patch('/users/update-account', data);

export const updateAvatar = (formData) =>
  API.patch('/users/update-avatar', formData);

export const updateCoverImage = (formData) =>
  API.patch('/users/update-cover-image', formData);

export const getChannelProfile = (username) =>
  API.get(`/users/get-channel/${username}`);

export const getWatchHistory = () =>
  API.get('/users/history');

// ── Videos ──
export const getAllVideos = (params) =>
  API.get('/videos/all-videos', { params });

export const getUserVideos = (params) =>
  API.get('/videos/user-videos', { params });

export const getVideoById = (videoId) =>
  API.get(`/videos/get-video/${videoId}`);

export const publishVideo = (formData) =>
  API.post('/videos/publish-video', formData);

export const updateVideo = (videoId, formData) =>
  API.patch(`/videos/update-video/${videoId}`, formData);

export const deleteVideo = (videoId) =>
  API.delete(`/videos/delete-video/${videoId}`);

export const togglePublishStatus = (videoId) =>
  API.patch(`/videos/toggle-status/${videoId}`);

export const watchVideo = (videoId) =>
  API.patch(`/videos/watch/${videoId}`);

// ── Comments ──
export const getVideoComments = (videoId, params) =>
  API.get(`/videos/${videoId}/comments`, { params });

export const addComment = (videoId, content) =>
  API.post(`/comments/add-comment/${videoId}`, { content });

export const updateComment = (commentId, newContent) =>
  API.patch(`/comments/update-comment/${commentId}`, { newContent });

export const deleteComment = (commentId) =>
  API.delete(`/comments/delete-comment/${commentId}`);

// ── Likes ──
export const toggleVideoLike = (videoId) =>
  API.post(`/likes/toggle-video-like/${videoId}`);

export const toggleCommentLike = (commentId) =>
  API.post(`/likes/toggle-comment-like/${commentId}`);

export const getLikedVideos = () =>
  API.get('/likes/get-liked-videos');

export const isCommentLiked = (commentId) =>
  API.get(`/likes/is-comment-liked/${commentId}`);

export const isTweetLiked = (tweetId) =>
  API.get(`/likes/is-tweet-liked/${tweetId}`);

export const getVideoLikes = (videoId) =>
  API.get(`/likes/video/${videoId}`);

export const getCommentLikes = (commentId) =>
  API.get(`/likes/comment/${commentId}`);

export const getTweetLikes = (tweetId) =>
  API.get(`/likes/tweet/${tweetId}`);

// ── Subscriptions ──
export const toggleSubscription = (channelId) =>
  API.post(`/subscriptions/toggle/${channelId}`);

export const getSubscribers = (channelId) =>
  API.get(`/subscriptions/get-subscribers/${channelId}`);

export const getSubscribedChannels = (subscriberId) =>
  API.get(`/subscriptions/get-subscribed/${subscriberId}`);

// ── Playlists ──
export const createPlaylist = (data) =>
  API.post('/playlists/create-playlist', data);

export const getUserPlaylists = (userId) =>
  API.get(`/playlists/user-playlist/${userId}`);

export const getPlaylistById = (playlistId) =>
  API.get(`/playlists/get-playlist/${playlistId}`);

export const addVideoToPlaylist = (playlistId, videoId) =>
  API.post(`/playlists/add-video/${playlistId}/videos/${videoId}`);

export const removeVideoFromPlaylist = (playlistId, videoId) =>
  API.delete(`/playlists/remove-video/${playlistId}/videos/${videoId}`);

export const updatePlaylist = (playlistId, data) =>
  API.patch(`/playlists/update-playlist/${playlistId}`, data);

export const deletePlaylist = (playlistId) =>
  API.delete(`/playlists/delete-playlist/${playlistId}`);

// ── Dashboard ──
export const getChannelStats = (userId) =>
  API.get(`/dashboard/channel-stats/${userId}`);

export const getChannelVideos = (userId, params) =>
  API.get(`/dashboard/channel-videos/${userId}`, { params });

// ── Health ──
export const healthCheck = () =>
  API.get('/healthCheck');

// ── Tweets / Posts ──
export const createTweet = (content) =>
  API.post('/tweets', { content });

export const getUserTweets = (userId) =>
  API.get(`/tweets/user/${userId}`);

export const updateTweet = (tweetId, content) =>
  API.patch(`/tweets/${tweetId}`, { content });

export const deleteTweet = (tweetId) =>
  API.delete(`/tweets/${tweetId}`);

export const toggleTweetLike = (tweetId) =>
  API.post(`/likes/toggle-tweet-like/${tweetId}`);

