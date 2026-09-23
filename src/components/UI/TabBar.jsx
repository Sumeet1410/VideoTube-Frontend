import React from 'react';
import './TabBar.css';

export default function TabBar({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  idPrefix = 'tab-',
  style,
}) {
  return (
    <div
      className={`ui-tab-bar ${className}`.trim()}
      style={style}
      role="tablist"
      aria-orientation="horizontal"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const buttonId = tab.elementId || (idPrefix ? `${idPrefix}${tab.id}` : undefined);

        return (
          <button
            key={tab.id}
            id={buttonId}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`ui-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange && onChange(tab.id)}
          >
            {tab.icon && <span className="ui-tab-btn-icon">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count !== null && (
              <span className="ui-tab-btn-badge">{tab.count}</span>
            )}
            {tab.badge !== undefined && tab.badge !== null && (
              <span className="ui-tab-btn-badge">{tab.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
