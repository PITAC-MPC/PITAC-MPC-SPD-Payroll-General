import { describe, expect, it } from 'vitest';
import {
  clampRowIndex,
  nextCellIndex,
  nextRowIndex,
  previousRowIndex,
} from '../src/lib/navigation';

describe('clampRowIndex', () => {
  it('keeps the index inside the bounds', () => {
    expect(clampRowIndex(-2, 5)).toBe(0);
    expect(clampRowIndex(3, 5)).toBe(3);
    expect(clampRowIndex(9, 5)).toBe(4);
  });

  it('returns -1 when there are no rows', () => {
    expect(clampRowIndex(0, 0)).toBe(-1);
  });
});

describe('nextRowIndex', () => {
  it('moves down one row', () => {
    expect(nextRowIndex(0, 5)).toBe(1);
  });

  it('stops at the last row', () => {
    expect(nextRowIndex(4, 5)).toBe(4);
  });

  it('returns -1 for an empty grid', () => {
    expect(nextRowIndex(0, 0)).toBe(-1);
  });
});

describe('previousRowIndex', () => {
  it('moves up one row', () => {
    expect(previousRowIndex(2, 5)).toBe(1);
  });

  it('stops at the first row', () => {
    expect(previousRowIndex(0, 5)).toBe(0);
  });
});

describe('nextCellIndex', () => {
  it('moves to the next cell', () => {
    expect(nextCellIndex(0, 4)).toBe(1);
  });

  it('stops at the last cell', () => {
    expect(nextCellIndex(3, 4)).toBe(3);
  });
});
