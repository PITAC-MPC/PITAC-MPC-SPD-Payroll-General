import { useEffect, useState } from 'react';
import { sanitizeDecimalString, sanitizeText, todayISO } from '../lib/format';

const STORAGE_KEY = 'pitac-payroll-general-draft-v1';

export const DEFAULT_META = {
  company: 'Pitac Multipurpose Cooperative',
  address: 'San Victores St., Brgy. 9, Malaybalay City',
  division: 'Special Project Division',
  periodLabel: 'Payroll for the Month of',
  period: 'INPUT MONTH HERE (ie September 16-30, 2026)',
};

export const DEFAULT_COLUMNS = {
  basicPay: true,
  rice: true,
  chicken: true,
  cashAdvance: true,
};

export const DEFAULT_SIGNATORIES = [
  {
    role: 'Prepared by',
    name: 'Joeffrey M. Serdan',
    title: 'Logistic Manager',
  },
  {
    role: 'Certified Correct by',
    name: 'Joel T. Rivera',
    title: 'SP-Division Head',
  },
  {
    role: 'Approved by',
    name: 'Ricky R. Chamen',
    title: 'COO',
  },
  {
    role: 'Paid by',
    name: 'Marietes G. Achacoso',
    title: 'Finance Manager',
  },
];

function makeId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmployee() {
  return {
    id: makeId(),
    name: '',
    basicPay: '',
    rice: '',
    chicken: '',
    cashAdvance: '',
    netPayTotalOverride: '',
  };
}

export function createEmptyState() {
  return {
    meta: { ...DEFAULT_META },
    columns: { ...DEFAULT_COLUMNS },
    employees: Array.from({ length: 2 }, createEmployee),
    signatories: DEFAULT_SIGNATORIES.map((item, index) => ({
      id: `signatory-${index}`,
      ...item,
    })),
  };
}

function normalizeEmployee(row) {
  return {
    id: typeof row?.id === 'string' && row.id ? row.id : makeId(),
    name: sanitizeText(row?.name, 80),
    basicPay: sanitizeDecimalString(row?.basicPay ?? ''),
    rice: sanitizeDecimalString(row?.rice ?? ''),
    chicken: sanitizeDecimalString(row?.chicken ?? ''),
    cashAdvance: sanitizeDecimalString(row?.cashAdvance ?? ''),
    netPayTotalOverride: sanitizeDecimalString(row?.netPayTotalOverride ?? ''),
  };
}

function normalizeColumns(columns) {
  const source = columns ?? {};

  return {
    basicPay: source.basicPay !== false,
    rice: source.rice !== false,
    chicken: source.chicken !== false,
    cashAdvance: source.cashAdvance !== false,
  };
}

function normalizeSignatories(signatories) {
  if (!Array.isArray(signatories) || signatories.length === 0) {
    return DEFAULT_SIGNATORIES.map((item, index) => ({
      id: `signatory-${index}`,
      ...item,
    }));
  }

  return signatories.map((item, index) => ({
    id:
      typeof item?.id === 'string' && item.id ? item.id : `signatory-${index}`,
    role: sanitizeText(item?.role ?? DEFAULT_SIGNATORIES[index]?.role, 40),
    name: sanitizeText(item?.name ?? DEFAULT_SIGNATORIES[index]?.name, 80),
    title: sanitizeText(item?.title ?? DEFAULT_SIGNATORIES[index]?.title, 60),
  }));
}

function loadDraft() {
  const fallback = createEmptyState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    const meta = parsed?.meta ?? {};

    return {
      meta: {
        company: sanitizeText(meta.company ?? DEFAULT_META.company, 80),
        address: sanitizeText(meta.address ?? DEFAULT_META.address, 120),
        division: sanitizeText(meta.division ?? DEFAULT_META.division, 60),
        periodLabel: sanitizeText(
          meta.periodLabel ?? DEFAULT_META.periodLabel,
          60,
        ),
        period: sanitizeText(meta.period ?? DEFAULT_META.period, 80),
      },
      columns: normalizeColumns(parsed?.columns),
      employees: Array.isArray(parsed?.employees)
        ? parsed.employees.map(normalizeEmployee)
        : fallback.employees,
      signatories: normalizeSignatories(parsed?.signatories),
    };
  } catch {
    return fallback;
  }
}

export default function usePayroll() {
  const [state, setState] = useState(loadDraft);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // A failed draft save should never interrupt data entry.
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [state]);

  const updateMeta = (field, value) => {
    if (!Object.keys(DEFAULT_META).includes(field)) return;

    setState((current) => ({
      ...current,
      meta: {
        ...current.meta,
        [field]: sanitizeText(value, 120),
      },
    }));
  };

  const toggleColumn = (key) => {
    if (!Object.keys(DEFAULT_COLUMNS).includes(key)) return;

    setState((current) => ({
      ...current,
      columns: {
        ...current.columns,
        [key]: !current.columns[key],
      },
    }));
  };

  const updateEmployee = (id, field, value) => {
    setState((current) => ({
      ...current,
      employees: current.employees.map((row) => {
        if (row.id !== id) return row;

        if (field === 'name') {
          return { ...row, name: sanitizeText(value, 80) };
        }

        if (field === 'netPayTotalOverride') {
          return {
            ...row,
            netPayTotalOverride: sanitizeDecimalString(value ?? ''),
          };
        }

        return { ...row, [field]: sanitizeDecimalString(value ?? '') };
      }),
    }));
  };

  const addEmployee = () => {
    setState((current) => ({
      ...current,
      employees: [...current.employees, createEmployee()],
    }));
  };

  const removeEmployee = (id) => {
    setState((current) => ({
      ...current,
      employees: current.employees.filter((row) => row.id !== id),
    }));
  };

  const updateSignatory = (id, field, value) => {
    if (!['role', 'name', 'title'].includes(field)) return;

    setState((current) => ({
      ...current,
      signatories: current.signatories.map((item) =>
        item.id === id ? { ...item, [field]: sanitizeText(value, 80) } : item,
      ),
    }));
  };

  const reset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures; the in-memory reset still applies.
    }

    setState(createEmptyState());
  };

  return {
    state,
    updateMeta,
    toggleColumn,
    updateEmployee,
    addEmployee,
    removeEmployee,
    updateSignatory,
    reset,
  };
}
