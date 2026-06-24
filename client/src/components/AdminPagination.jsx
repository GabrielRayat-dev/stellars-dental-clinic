import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/AdminPagination.css';

const AdminPagination = ({ totalItems, itemName, currentPage, totalPages, onPageChange }) => {
  return (
    <div className="admin-pagination">
      <span className="admin-pagination__count">
        {totalItems} {itemName}
      </span>
      
      <div className="admin-pagination__controls">
        <button
          className="admin-pagination__btn"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft size={14} />
        </button>
        
        <span className="admin-pagination__info">
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

export default AdminPagination;
