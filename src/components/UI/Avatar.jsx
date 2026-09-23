import { getInitials } from '../../utils/helpers';
import './Avatar.css';

export default function Avatar({ src, name, size = 40, className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`avatar ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
        }}
      />
    );
  }

  return (
    <div
      className={`avatar avatar-fallback ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials(name)}
    </div>
  );
}
