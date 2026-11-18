import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

async function renderApp() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = createRoot(container);

  await act(async () => {
    root.render(<App />);
  });

  return { container, root };
}

describe('App', () => {
  it('renders the payroll grid, header and signatories', async () => {
    const { container, root } = await renderApp();
    const text = container.textContent;

    expect(text).toContain('Name of Employee');
    expect(text).toContain('Basic Pay');
    expect(text).toContain('Deduction');
    expect(text).toContain('Add new deduction');
    expect(text).toContain('Net Pay');
    expect(text).not.toContain('Net Pay Total');
    expect(text).toContain('Prepared by');
    expect(text).toContain('Joeffrey M. Serdan');
    expect(container.querySelectorAll('.deduction-line').length).toBeGreaterThan(
      0,
    );

    root.unmount();
    container.remove();
  });

  it('renders the hidden print document', async () => {
    const { container, root } = await renderApp();

    expect(container.querySelector('.print-document')).not.toBeNull();
    expect(container.querySelector('.print-table')).not.toBeNull();
    expect(container.querySelectorAll('.print-signatory')).toHaveLength(4);

    root.unmount();
    container.remove();
  });

  it('has one computed net pay column on screen and on paper', async () => {
    const { container, root } = await renderApp();
    const labels = (selector) =>
      [...container.querySelectorAll(selector)].map((cell) =>
        cell.textContent.trim(),
      );

    expect(labels('.payslip-table thead th').filter((label) => label === 'Net Pay'))
      .toHaveLength(1);
    expect(labels('.print-table thead th')).toEqual([
      'Name of Employee',
      'Basic Pay',
      'Deduction',
      'Net Pay',
      'Signature',
    ]);

    root.unmount();
    container.remove();
  });

  it('adds and removes deduction entries on a row', async () => {
    const { container, root } = await renderApp();
    const firstRow = () => container.querySelectorAll('tbody tr')[0];
    const lineCount = () => firstRow().querySelectorAll('.deduction-line').length;
    const initial = lineCount();

    await act(async () => {
      firstRow().querySelector('.deduction-add').click();
    });

    expect(lineCount()).toBe(initial + 1);

    await act(async () => {
      firstRow().querySelector('.deduction-remove').click();
    });

    expect(lineCount()).toBe(initial);

    root.unmount();
    container.remove();
  });
});
