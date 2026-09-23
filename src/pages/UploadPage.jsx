import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { publishVideo } from '../api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';
import { HiUpload, HiFilm, HiPhotograph } from 'react-icons/hi';
import './UploadPage.css';

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }
    if (!thumbnail) {
      toast.error('Please select a thumbnail');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('isPublic', formData.isPublic);
      fd.append('videoFile', videoFile);
      fd.append('thumbnail', thumbnail);

      await publishVideo(fd);
      toast.success('Video uploaded! Processing will begin shortly.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Upload failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page" id="upload-page">
      <div className="upload-container glass animate-fade-in-up">
        <div className="upload-header">
          <HiUpload size={28} className="upload-header-icon" />
          <h1 className="upload-title">Upload Video</h1>
          <p className="upload-subtitle">Share your content with the world</p>
        </div>

        <form className="upload-form" onSubmit={handleSubmit} id="upload-form">
          {/* File selectors */}
          <div className="upload-files-row">
            <div
              className={`upload-drop-zone ${videoFile ? 'has-file' : ''}`}
              onClick={() => videoInputRef.current?.click()}
            >
              <HiFilm size={32} />
              <span className="drop-zone-text">
                {videoFile ? videoFile.name : 'Select video file'}
              </span>
              {videoFile && (
                <span className="drop-zone-size">
                  {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                hidden
              />
            </div>

            <div
              className={`upload-drop-zone ${thumbnail ? 'has-file' : ''}`}
              onClick={() => thumbInputRef.current?.click()}
            >
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail preview" className="thumb-preview" />
              ) : (
                <>
                  <HiPhotograph size={32} />
                  <span className="drop-zone-text">Select thumbnail</span>
                </>
              )}
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                hidden
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="upload-title">Title</label>
            <input
              type="text"
              id="upload-title"
              name="title"
              className="form-input"
              placeholder="Enter video title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="upload-description">Description</label>
            <textarea
              id="upload-description"
              name="description"
              className="form-textarea"
              placeholder="Describe your video..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="upload-toggle-row">
            <label className="toggle-label" htmlFor="upload-public">
              <span>Public</span>
              <span className="toggle-hint">
                {formData.isPublic ? 'Everyone can see this video' : 'Only you can see this video'}
              </span>
            </label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="upload-public"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={<HiUpload />}
            id="upload-submit"
          >
            Upload Video
          </Button>
        </form>
      </div>
    </div>
  );
}
