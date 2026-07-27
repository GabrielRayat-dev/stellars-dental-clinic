import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/AdminPagination.css'; // Reuse the excellent style defined for pagination

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="admin-pagination" style={{ borderTop: 'none', background: 'transparent', padding: '0.5rem 0 0 0' }}>
      <div className="admin-pagination__controls" style={{ marginLeft: 'auto' }}>
        <button
          className="admin-pagination__btn"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft size={14} />
        </button>
        
        <span className="admin-pagination__info" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}>
          {currentPage} / {totalPages}
        </span>
        
        <button
          className="admin-pagination__btn"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
