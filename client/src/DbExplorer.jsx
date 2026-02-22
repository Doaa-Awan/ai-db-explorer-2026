import { useState } from 'react';
import ChatBot from './components/chat/ChatBot';
import ERDModal from './components/ERDModal';
import { HiOutlineSquares2X2 } from 'react-icons/hi2';

export default function DbExplorer({ tables = [], onBack, onExit }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedTables, setExpandedTables] = useState({});
  const [erdOpen, setErdOpen] = useState(false);

  const handleBack = () => {
    if (typeof onExit === 'function') {
      void onExit();
    }
    if (typeof onBack === 'function') {
      onBack();
    }
  };

  const toggleTable = (event, tableName) => {
    event.stopPropagation();
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  return (
    <div className='db-explorer-shell'>
      <header className='db-explorer-header'>
        <div>
          <p className='eyebrow'>AI DB Explorer</p>
          <h2>Ask the database</h2>
          <p className='subtitle'>Use plain language to explore tables, rows, and relationships.</p>
          <div className="db-explorer-header-actions">
            <button
              className="btn ghost erd-trigger"
              type="button"
              onClick={() => setErdOpen(true)}
              title="View entity relationship diagram"
            >
              <HiOutlineSquares2X2 />
              <span>View ERD</span>
            </button>
            <button
              className='btn ghost chat-back'
              type='button'
              onClick={handleBack}
            >
              Back
            </button>
          </div>
        </div>
      </header>

      {erdOpen && (
        <ERDModal tables={tables} onClose={() => setErdOpen(false)} />
      )}

      <div className={`db-explorer-body ${isCollapsed ? 'collapsed' : ''}`}>
        <section className='db-main'>
          <ChatBot />
        </section>

        <aside
          className={`db-sidebar ${isCollapsed ? 'collapsed' : ''}`}
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          <button
            className='sidebar-toggle'
            type='button'
            onClick={(event) => {
              event.stopPropagation();
              setIsCollapsed((prev) => !prev);
            }}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '>' : '<'}
          </button>
          <div className='sidebar-header'>
            <div>
              <h3>Tables</h3>
              <p className='sidebar-meta'>{tables.length} total</p>
            </div>
          </div>
          <div className='table-list'>
            {tables.length === 0 ? (
              <p className='empty-state'>No tables found.</p>
            ) : (
              <ul>
                {tables.map((table) => (
                  <li
                    key={table.name}
                    className='table-item'
                  >
                    <button
                      className='table-row'
                      type='button'
                      onClick={(event) => toggleTable(event, table.name)}
                    >
                      <span className='table-name'>{table.name}</span>
                      <span className='count'>{table.columnCount} cols</span>
                    </button>
                    {expandedTables[table.name] && table.columns?.length ? (
                      <ul className='column-list'>
                        {table.columns.map((column) => (
                          <li key={`${table.name}.${column.name}`}>
                            <span className='column-name'>{column.name}</span>
                            <span className='column-meta'>
                              {column.dataType}
                              {column.isPrimary ? <span className='key-badge'>PK</span> : null}
                              {column.isForeign ? <span className='key-badge'>FK{column.foreignTable ? ` → ${column.foreignTable}` : ''}</span> : null}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
