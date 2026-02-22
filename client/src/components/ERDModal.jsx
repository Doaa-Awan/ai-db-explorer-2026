import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { HiXMark, HiMagnifyingGlassPlus, HiMagnifyingGlassMinus, HiArrowsPointingOut } from 'react-icons/hi2';

const CELL_WIDTH = 220;
const CELL_HEIGHT = 200;
const PADDING = 40;

function computeLayout(tables) {
  if (!tables?.length) return { positions: new Map(), width: 0, height: 0 };
  const cols = Math.ceil(Math.sqrt(tables.length));
  const positions = new Map();
  tables.forEach((table, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.set(table.name, { x: PADDING + col * CELL_WIDTH, y: PADDING + row * CELL_HEIGHT });
  });
  const last = tables.length - 1;
  const lastCol = last % cols;
  const lastRow = Math.floor(last / cols);
  const width = PADDING * 2 + (lastCol + 1) * CELL_WIDTH;
  const height = PADDING * 2 + (lastRow + 1) * CELL_HEIGHT;
  return { positions, width, height };
}

function collectRelationships(tables) {
  const rels = [];
  if (!tables?.length) return rels;
  tables.forEach((table) => {
    table.columns?.forEach((col) => {
      if (col.isForeign && col.foreignTable) {
        rels.push({
          fromTable: table.name,
          fromColumn: col.name,
          toTable: col.foreignTable,
          toColumn: col.foreignColumn || null,
        });
      }
    });
  });
  return rels;
}

export default function ERDModal({ tables = [], onClose }) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.7);
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const modalStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const containerRef = useRef(null);
  const viewportRef = useRef(null);

  const { positions, width, height } = useMemo(() => computeLayout(tables), [tables]);
  const relationships = useMemo(() => collectRelationships(tables), [tables]);

  const minZoom = 0.2;
  const maxZoom = 1.5;

  const handleDiagramMouseDown = useCallback((e) => {
    if (e.target.closest('.erd-table-card') || e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleDiagramMouseMove = useCallback(
    (e) => {
      if (isPanning) {
        setPan({
          x: panStart.current.panX + e.clientX - panStart.current.x,
          y: panStart.current.panY + e.clientY - panStart.current.y,
        });
      }
    },
    [isPanning]
  );

  const handleDiagramMouseUp = useCallback(() => setIsPanning(false), []);
  const handleDiagramMouseLeave = useCallback(() => setIsPanning(false), []);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(maxZoom, z + 0.1)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(minZoom, z - 0.1)), []);

  const handleResetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(0.7);
  }, []);

  const handleModalHeaderMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.button !== 0) return;
    setIsDraggingModal(true);
    modalStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: modalPosition.x,
      posY: modalPosition.y,
    };
  }, [modalPosition]);

  const handleModalMouseMove = useCallback(
    (e) => {
      if (isDraggingModal) {
        setModalPosition({
          x: modalStart.current.posX + e.clientX - modalStart.current.x,
          y: modalStart.current.posY + e.clientY - modalStart.current.y,
        });
      }
    },
    [isDraggingModal]
  );

  const handleModalMouseUp = useCallback(() => setIsDraggingModal(false), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((z) => Math.min(maxZoom, Math.max(minZoom, z + delta)));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const linePath = (from, to) => {
    const cx = (from.x + to.x) / 2;
    const mid = from.y < to.y ? { x: cx, y: from.y + 40 } : { x: cx, y: to.y + 40 };
    return `M ${from.x} ${from.y} C ${mid.x} ${mid.y}, ${mid.x} ${mid.y}, ${to.x} ${to.y}`;
  };

  return (
    <div
      className="erd-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onMouseMove={handleModalMouseMove}
      onMouseUp={handleModalMouseUp}
      onMouseLeave={handleModalMouseUp}
    >
      <div
        className="erd-modal"
        style={{
          transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="erd-modal-header"
          onMouseDown={handleModalHeaderMouseDown}
        >
          <div className="erd-modal-title">
            <span className="erd-modal-drag-handle" aria-hidden />
            Entity Relationship Diagram
          </div>
          <div className="erd-modal-actions">
            <button
              type="button"
              className="erd-zoom-btn"
              onClick={handleZoomOut}
              aria-label="Zoom out"
            >
              <HiMagnifyingGlassMinus />
            </button>
            <span className="erd-zoom-label">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className="erd-zoom-btn"
              onClick={handleZoomIn}
              aria-label="Zoom in"
            >
              <HiMagnifyingGlassPlus />
            </button>
            <button
              type="button"
              className="erd-zoom-btn"
              onClick={handleResetView}
              aria-label="Reset view"
              title="Reset pan and zoom"
            >
              <HiArrowsPointingOut />
            </button>
            <button
              type="button"
              className="erd-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <HiXMark />
            </button>
          </div>
        </header>

        <div className="erd-modal-body">
          <div
            ref={viewportRef}
            className="erd-viewport"
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            onMouseDown={handleDiagramMouseDown}
            onMouseMove={handleDiagramMouseMove}
            onMouseUp={handleDiagramMouseUp}
            onMouseLeave={handleDiagramMouseLeave}
          >
            {tables.length === 0 ? (
              <div className="erd-empty-state">
                <p>No tables in the schema.</p>
                <p className="erd-empty-hint">Connect to a database and load schema to see the ERD.</p>
              </div>
            ) : (
            <div
              ref={containerRef}
              className="erd-diagram-container"
              style={{
                width: Math.max(width, 400),
                height: Math.max(height, 300),
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
              }}
            >
              <svg
                className="erd-lines-svg"
                width={width}
                height={height}
                style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
              >
                <defs>
                  <marker
                    id="erd-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" opacity="0.9" />
                  </marker>
                </defs>
                {relationships.map((rel, i) => {
                  const fromPos = positions.get(rel.fromTable);
                  const toPos = positions.get(rel.toTable);
                  if (!fromPos || !toPos) return null;
                  const from = {
                    x: fromPos.x + CELL_WIDTH / 2,
                    y: fromPos.y + CELL_HEIGHT,
                  };
                  const to = {
                    x: toPos.x + CELL_WIDTH / 2,
                    y: toPos.y,
                  };
                  return (
                    <g key={`${rel.fromTable}-${rel.fromColumn}-${rel.toTable}-${i}`}>
                      <path
                        d={linePath(from, to)}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                        strokeOpacity="0.85"
                        markerEnd="url(#erd-arrow)"
                      />
                    </g>
                  );
                })}
              </svg>
              <div className="erd-tables-layer">
                {tables.map((table) => {
                  const pos = positions.get(table.name);
                  if (!pos) return null;
                  return (
                    <div
                      key={table.name}
                      className="erd-table-card"
                      style={{
                        left: pos.x + 8,
                        top: pos.y + 8,
                        width: CELL_WIDTH - 16,
                        minHeight: CELL_HEIGHT - 16,
                      }}
                    >
                      <div className="erd-table-name">{table.name}</div>
                      <ul className="erd-column-list">
                        {table.columns?.slice(0, 8).map((col) => (
                          <li key={`${table.name}-${col.name}`}>
                            <span className="erd-col-name">{col.name}</span>
                            <span className="erd-col-meta">
                              {col.isPrimary && <span className="erd-badge pk">PK</span>}
                              {col.isForeign && (
                                <span className="erd-badge fk">FK</span>
                              )}
                            </span>
                          </li>
                        ))}
                        {table.columns?.length > 8 && (
                          <li className="erd-col-more">+{table.columns.length - 8} more</li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>
          <p className="erd-hint">Drag the diagram to pan • Scroll to zoom • Drag the title bar to move this window</p>
        </div>
      </div>
    </div>
  );
}
