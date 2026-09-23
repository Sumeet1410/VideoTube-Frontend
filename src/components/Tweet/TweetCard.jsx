import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPencil, HiTrash, HiThumbUp, HiOutlineThumbUp } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';
import { formatDate } from '../../utils/helpers';
import './TweetCard.css';

export default function TweetCard({
  tweet,
  author,
  isOwner: isOwnerProp,
  isLiked = false,
  likesCount = 0,
  onToggleLike,
  onDelete,
  onEdit,
  onUpdate,
  showLikeButton = true,
  showActions = true,
  className = '',
}) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tweet?.content || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditText(tweet?.content || '');
  }, [tweet?.content]);

  if (!tweet) return null;

  const authorData =
    author ||
    tweet.author ||
    (typeof tweet.owner === 'object' ? tweet.owner : null) ||
    {};

  const authorId = authorData._id || (typeof tweet.owner === 'string' ? tweet.owner : null);
  const authorName = authorData.fullName || authorData.username || user?.fullName || 'User';
  const authorUsername = authorData.username || user?.username || '';
  const authorAvatar = authorData.avatar || '';

  const isOwner =
    isOwnerProp !== undefined
      ? isOwnerProp
      : user?._id && (user._id === authorId || (authorUsername && user.username === authorUsername));

  const handleStartEdit = () => {
    if (onEdit) {
      onEdit(tweet);
    } else if (onUpdate) {
      setEditText(tweet.content || '');
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(tweet.content || '');
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || isSaving) return;
    setIsSaving(true);
    try {
      if (onUpdate) {
        await onUpdate(tweet._id, editText.trim());
      }
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`tweet-card glass animate-fade-in-up ${className}`}>
      {/* Header */}
      <div className="tweet-card-header">
        {authorUsername ? (
          <Link to={`/channel/${authorUsername}`} className="tweet-author-link">
            <Avatar src={authorAvatar} name={authorName} size={42} />
          </Link>
        ) : (
          <Avatar src={authorAvatar} name={authorName} size={42} />
        )}

        <div className="tweet-card-meta">
          <div className="tweet-card-author-line">
            {authorUsername ? (
              <Link to={`/channel/${authorUsername}`} className="tweet-author-link">
                <span className="tweet-author-name">{authorName}</span>
              </Link>
            ) : (
              <span className="tweet-author-name">{authorName}</span>
            )}

            {authorUsername && (
              <span className="tweet-author-handle">@{authorUsername}</span>
            )}

            <span className="tweet-dot">•</span>
            <span className="tweet-date">{formatDate(tweet.createdAt)}</span>
          </div>
        </div>

        {/* Owner actions (Edit/Delete) */}
        {showActions && isOwner && !isEditing && (
          <div className="tweet-actions-menu">
            {(onEdit || onUpdate) && (
              <button
                type="button"
                className="tweet-action-btn"
                onClick={handleStartEdit}
                title="Edit post"
              >
                <HiPencil size={16} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="tweet-action-btn danger"
                onClick={() => onDelete(tweet._id)}
                title="Delete post"
              >
                <HiTrash size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body / Inline Edit Mode */}
      {isEditing ? (
        <div className="tweet-edit-container">
          <textarea
            className="tweet-edit-textarea"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            disabled={isSaving}
            autoFocus
          />
          <div className="tweet-edit-buttons">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveEdit}
              disabled={!editText.trim() || isSaving}
              loading={isSaving}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="tweet-body-text">{tweet.content}</p>
      )}

      {/* Footer / Likes */}
      {showLikeButton && (
        <div className="tweet-card-footer">
          {onToggleLike ? (
            <button
              type="button"
              className={`tweet-like-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => onToggleLike(tweet._id)}
            >
              {isLiked ? <HiThumbUp size={16} /> : <HiOutlineThumbUp size={16} />}
              <span>{(likesCount || 0) > 0 ? likesCount : 'Like'}</span>
            </button>
          ) : (
            <span className="tweet-like-btn static">
              <HiThumbUp size={16} />
              <span>{likesCount || 0}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
