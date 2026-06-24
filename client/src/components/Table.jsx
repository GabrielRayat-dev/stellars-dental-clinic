import React from 'react';
import '../styles/Table.css';

export const TableWrap = ({ children }) => (
  <div className="st-table-wrap">
    {children}
  </div>
);

export const Table = ({ headers, children }) => {
  return (
    <table className="st-table">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  );
};
