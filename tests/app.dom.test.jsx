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
    expect(text).toContain('Cash Advance');
    expect(text).toContain('Net Pay');
    expect(text).toContain('Net Pay Total');
    expect(text).toContain('Prepared by');
    expect(text).toContain('Joeffrey M. Serdan');

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
});
