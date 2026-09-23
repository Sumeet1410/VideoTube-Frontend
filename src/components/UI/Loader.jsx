import './Loader.css';

export default function Loader({ fullScreen = false, size = 40 }) {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader-spinner" style={{ width: size, height: size }} />
      </div>
    );
  }

  return <div className="loader-spinner" style={{ width: size, height: size }} />;
}
