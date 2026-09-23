import React from 'react';
import './EmptyState.css';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  glass = true,
  className = '',
  style,
  id,
}) {
  return (
    <div
      className={`ui-empty-state ${glass ? 'glass' : ''} ${className}`.trim()}
      style={style}
      id={id}
    >
      {icon && (
        <div className="ui-empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      {title && <h3 className="ui-empty-state-title">{title}</h3>}
      {description && <p className="ui-empty-state-desc">{description}</p>}
      {action && <div className="ui-empty-state-action">{action}</div>}
      {children}
    </div>
  );
}
