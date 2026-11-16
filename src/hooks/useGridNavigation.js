import { useEffect } from 'react';
import { nextRowIndex, previousRowIndex } from '../lib/navigation';

function findCell(rowIndex, colIndex) {
  return document.querySelector(
    `[data-grid-row="${rowIndex}"][data-grid-col="${colIndex}"]`,
  );
}

function focusCell(rowIndex, colIndex) {
  const cell = findCell(rowIndex, colIndex);
  if (!cell) return false;

  cell.focus();
  if (typeof cell.select === 'function') {
    cell.select();
  }

  return true;
}

/**
 * Grid keyboard navigation for the payroll table.
 *
 * - Arrow Up / Arrow Down move between rows.
 * - Enter moves to the same column of the next row.
 * - Ctrl + Enter adds a new row and focuses its first cell.
 */
export default function useGridNavigation({
  getRowCount,
  onAddRow,
  getColumnCount,
}) {
  useEffect(() => {
    const handler = (event) => {
      const target = event.target;
      if (!target || typeof target.getAttribute !== 'function') return;

      const rowIndex = target.getAttribute('data-grid-row');
      const colIndex = target.getAttribute('data-grid-col');

      if (rowIndex === null || colIndex === null) return;

      const currentRow = Number(rowIndex);
      const currentCol = Number(colIndex);
      const rowCount = getRowCount?.() ?? 0;
      const columnCount = getColumnCount?.() ?? 0;

      if (event.key === 'ArrowDown') {
        const next = nextRowIndex(currentRow, rowCount, 1);
        if (next !== currentRow && focusCell(next, currentCol)) {
          event.preventDefault();
        }
        return;
      }

      if (event.key === 'ArrowUp') {
        const previous = previousRowIndex(currentRow, rowCount);
        if (previous !== currentRow && focusCell(previous, currentCol)) {
          event.preventDefault();
        }
        return;
      }

      if (event.key === 'Enter') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onAddRow?.();
          return;
        }

        if (event.shiftKey) return;

        const isLastColumn = currentCol >= columnCount - 1;
        if (isLastColumn) return;

        event.preventDefault();
        const next = nextRowIndex(currentRow, rowCount, 1);

        if (next === currentRow) {
          focusCell(currentRow, currentCol + 1);
          return;
        }

        focusCell(next, currentCol);
      }
    };

    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
  }, [getRowCount, getColumnCount, onAddRow]);
}
