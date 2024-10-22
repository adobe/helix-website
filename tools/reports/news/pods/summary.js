export default function buildSummary(name, label, value) {
  if (document.querySelector(`.summary.${name}`)) {
    document.querySelector(`.summary.${name}`).remove();
  }
  const section = document.createElement('div');
  section.className = `summary ${name}`;
  section.innerHTML = `<p class="summary-value">${value}</p>
    <p class="summary-label">${label}</p>`;
  return section;
}
