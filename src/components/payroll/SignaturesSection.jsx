import SectionHeading from '../ui/SectionHeading';
import TextInput from '../ui/TextInput';

/**
 * The four signatory blocks (Prepared by, Certified Correct by, Approved by,
 * Paid by). Each block is editable on screen and printed as a signature band.
 */
export default function SignaturesSection({ signatories, onUpdate }) {
  return (
    <section className="payroll-section">
      <SectionHeading
        eyebrow="Authorization"
        title="Signatories"
        description="Names and titles printed below the payroll table."
      />

      <div className="signatory-grid">
        {signatories.map((signatory) => (
          <div className="signatory-card" key={signatory.id}>
            <TextInput
              className="signatory-role"
              value={signatory.role}
              ariaLabel={`${signatory.role} label`}
              onChange={(value) => onUpdate(signatory.id, 'role', value)}
            />
            <div className="signatory-line" />
            <TextInput
              className="signatory-name"
              value={signatory.name}
              placeholder="Name"
              ariaLabel={`${signatory.role} name`}
              onChange={(value) => onUpdate(signatory.id, 'name', value)}
            />
            <TextInput
              className="signatory-title"
              value={signatory.title}
              placeholder="Position"
              ariaLabel={`${signatory.role} title`}
              onChange={(value) => onUpdate(signatory.id, 'title', value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
