/**
 * Section heading with an optional eyebrow, description and action button.
 * Screen-only elements are marked so they never appear in the print output.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <div className="section-eyebrow">{eyebrow}</div> : null}
        <h2 className="section-title">{title}</h2>
        {description ? (
          <p className="section-description">{description}</p>
        ) : null}
      </div>
      {action ? <div className="section-action no-print">{action}</div> : null}
    </div>
  );
}
