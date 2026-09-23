import React from 'react';
import './Pagination.css';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  prevLabel = '← Previous',
  nextLabel = 'Next →',
  className = '',
  id = 'pagination',
  style,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className={`pagination ui-pagination ${className}`.trim()}
      id={id}
      style={style}
      role="navigation"
      aria-label="Pagination Navigation"
    >
      <button
        type="button"
        className="pagination-btn ui-pagination-btn"
        disabled={currentPage <= 1}
        onClick={handlePrev}
        aria-label="Go to previous page"
      >
        {prevLabel}
      </button>

      <div className="pagination-info ui-pagination-info">
        <span className="pagination-current ui-pagination-current">{currentPage}</span>
        <span className="pagination-sep ui-pagination-sep">/</span>
        <span>{totalPages}</span>
      </div>

      <button
        type="button"
        className="pagination-btn ui-pagination-btn"
        disabled={currentPage >= totalPages}
        onClick={handleNext}
        aria-label="Go to next page"
      >
        {nextLabel}
      </button>
    </div>
  );
}
