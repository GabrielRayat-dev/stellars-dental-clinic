import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { TableWrap, Table } from '../components/Table';
import SearchBar from '../components/SearchBar';
import AdminPagination from '../components/AdminPagination';
import '../styles/DentistSchedule.css';
import '../styles/AdminLogs.css';

const ROWS_PER_PAGE = 10;

const AssistantLogs = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load logs');
      setLogs(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Derived State: search filter (role is always 'assistant' via the API)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      return (
        (log.actor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.resource_type || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [logs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ROWS_PER_PAGE));
  const pageLogs = filteredLogs.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [searchQuery]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <main className="ds-page">
      <Header
        title={<><ClipboardList size={28} /> Activity Logs</>}
        subtitle="View all assistant activity logs"
        onBack={() => navigate('/dashboard/assistant')}
      />

      <div className="al-filters">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, action, or resource..."
        />
      </div>

      <TableWrap>
        {loading ? (
          <div className="al-state">
            <Loader2 size={24} className="al-spin" />
            <span>Loading activity logs…</span>
          </div>
        ) : error ? (
          <div className="al-state al-state--error">
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        ) : (
          <>
            <Table headers={['Date & Time', 'User', 'Role', 'Action', 'Resource Type']}>
              {pageLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="st-table__empty">No logs found matching your criteria.</td>
                </tr>
              ) : (
                pageLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.created_at)}</td>
                    <td><strong>{log.actor_name || 'System'}</strong></td>
                    <td>
                      <span className={`al-badge al-badge--${(log.actor_role || '').toLowerCase()}`}>
                        {log.actor_role || 'N/A'}
                      </span>
                    </td>
                    <td>{log.action}</td>
                    <td>{log.resource_type || '—'}</td>
                  </tr>
                ))
              )}
            </Table>

            {filteredLogs.length > 0 && (
              <AdminPagination
                totalItems={filteredLogs.length}
                itemName="logs"
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </TableWrap>
    </main>
  );
};

export default AssistantLogs;
