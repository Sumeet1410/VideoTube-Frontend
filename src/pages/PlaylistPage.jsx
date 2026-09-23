import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from '../api';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Loader from '../components/UI/Loader';
import EmptyState from '../components/UI/EmptyState';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';
import { HiPlus, HiTrash, HiPencil, HiCollection } from 'react-icons/hi';
import './PlaylistPage.css';

export default function PlaylistPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit State
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getUserPlaylists(user._id);
        setPlaylists(data?.data || []);
      } catch {}
      setLoading(false);
    };
    if (user?._id) fetch();
  }, [user?._id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) { toast.error('Name is required'); return; }
    setCreating(true);
    try {
      const { data } = await createPlaylist({ name: newName.trim(), description: newDesc.trim() });
      setPlaylists((prev) => [data?.data, ...prev]);
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      toast.success('Playlist created');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create playlist'));
    }
    setCreating(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) { toast.error('Name is required'); return; }
    setUpdating(true);
    try {
      const { data } = await updatePlaylist(editingPlaylist._id, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setPlaylists((prev) =>
        prev.map((p) =>
          p._id === editingPlaylist._id
            ? { ...p, name: data?.data?.name || editName.trim(), description: editDesc.trim() }
            : p
        )
      );
      setEditingPlaylist(null);
      toast.success('Playlist updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update playlist'));
    }
    setUpdating(false);
  };

  const handleDelete = async (playlistId) => {
    if (!confirm('Delete this playlist?')) return;
    try {
      await deletePlaylist(playlistId);
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
      toast.success('Playlist deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="playlist-page" id="playlist-page">
      <div className="playlist-header">
        <h1 className="page-title">Your Playlists</h1>
        <Button variant="primary" size="sm" icon={<HiPlus />} onClick={() => setShowCreate(true)} id="create-playlist-btn">
          New Playlist
        </Button>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          icon={<HiCollection size={48} />}
          title="No playlists yet"
          description="Create your first playlist to organize your favorite videos"
          action={
            <Button variant="primary" size="sm" icon={<HiPlus />} onClick={() => setShowCreate(true)}>
              New Playlist
            </Button>
          }
        />
      ) : (
        <div className="playlists-grid">
          {playlists.map((pl) => (
            <div key={pl._id} className="playlist-card glass animate-fade-in-up">
              <Link to={`/playlist/${pl._id}`} className="playlist-card-content">
                <div className="playlist-card-icon">
                  <HiCollection size={28} />
                  <span className="playlist-video-count">{pl.videos?.length || 0} videos</span>
                </div>
                <h3 className="playlist-card-name truncate">{pl.name}</h3>
                {pl.description && (
                  <p className="playlist-card-desc truncate-2">{pl.description}</p>
                )}
              </Link>
              <div className="playlist-card-actions">
                <button
                  className="playlist-card-action-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingPlaylist(pl);
                    setEditName(pl.name);
                    setEditDesc(pl.description || '');
                  }}
                  title="Edit playlist"
                >
                  <HiPencil size={15} />
                </button>
                <button
                  className="playlist-card-action-btn danger"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(pl._id);
                  }}
                  title="Delete playlist"
                >
                  <HiTrash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Playlist">
        <form onSubmit={handleCreate} className="create-playlist-form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" placeholder="My playlist" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea className="form-textarea" placeholder="Describe your playlist..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
          </div>
          <Button type="submit" variant="primary" fullWidth loading={creating}>
            Create Playlist
          </Button>
        </form>
      </Modal>

      {/* Edit Modal (Item 6) */}
      <Modal isOpen={!!editingPlaylist} onClose={() => setEditingPlaylist(null)} title="Edit Playlist">
        <form onSubmit={handleUpdate} className="create-playlist-form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" placeholder="Playlist name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea className="form-textarea" placeholder="Describe your playlist..." value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setEditingPlaylist(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={updating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
