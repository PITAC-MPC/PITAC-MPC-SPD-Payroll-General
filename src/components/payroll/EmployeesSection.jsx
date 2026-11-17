import { MONEY_COLUMNS } from '../../lib/columns';
import SectionHeading from '../ui/SectionHeading';
import EmployeeRow from './EmployeeRow';
import TotalRow from './TotalRow';

function buildColIndexes(columns) {
  const focusable = ['name'];

  MONEY_COLUMNS.forEach((column) => {
    if (columns.some((item) => item.key === column.key)) {
      focusable.push(column.key);
    }
  });

  focusable.push('netPayTotal');

  return focusable.reduce((accumulator, key, index) => {
    accumulator[key] = index;
    return accumulator;
  }, {});
}

function colClass(key) {
  if (key === 'name') return 'col-name';
  if (key === 'deduction') return 'col-money col-deduction';
  if (key === 'signature') return 'col-signature';
  return 'col-money';
}

/**
 * The editable payroll grid with its totals row.
 */
export default function EmployeesSection({
  rows,
  totals,
  columns,
  onUpdate,
  onAdd,
  onRemove,
}) {
  const colIndexes = buildColIndexes(columns);

  return (
    <section className="payroll-section">
      <SectionHeading
        eyebrow="Employees"
        title="Payroll Details"
        description="Net pay is computed automatically. Net pay total accepts an override value."
        action={
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={onAdd}
          >
            <i className="bi bi-plus-lg" /> Add Employee
          </button>
        }
      />

      <div className="payslip-table-wrap">
        <div className="table-responsive">
          <table className="payslip-table payroll-table">
            <colgroup>
              {columns.map((column) => (
                <col key={column.key} className={colClass(column.key)} />
              ))}
              <col className="col-action" />
            </colgroup>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={column.key === 'name' ? '' : 'th-num'}
                  >
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="row-action no-print">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <EmployeeRow
                  key={row.id}
                  row={row}
                  index={index}
                  columns={columns}
                  colIndexes={colIndexes}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              ))}
            </tbody>
            <tfoot>
              <TotalRow totals={totals} columns={columns} />
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}
