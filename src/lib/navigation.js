/**
 * Pure helpers for the payroll grid keyboard navigation.
 */

/**
 * Clamps a row index inside the available bounds.
 */
export function clampRowIndex(index, rowCount) {
  if (rowCount <= 0) return -1;
  if (index < 0) return 0;
  if (index > rowCount - 1) return rowCount - 1;
  return index;
}

/**
 * Returns the next row index for a vertical move.
 */
export function nextRowIndex(currentIndex, rowCount, direction = 1) {
  if (rowCount <= 0) return -1;
  return clampRowIndex(currentIndex + direction, rowCount);
}

/**
 * Returns the previous row index, never moving above the first row.
 */
export function previousRowIndex(currentIndex, rowCount) {
  if (rowCount <= 0) return -1;
  return clampRowIndex(currentIndex - 1, rowCount);
}

/**
 * Returns the index of the next focusable cell inside a row.
 */
export function nextCellIndex(currentIndex, cellCount) {
  if (cellCount <= 0) return -1;
  if (currentIndex >= cellCount - 1) return cellCount - 1;
  return currentIndex + 1;
}
