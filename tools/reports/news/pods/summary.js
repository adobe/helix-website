export default function buildSummary(name, label, value) {
  const section = document.createElement('div');
  section.className = `summary ${name}`;
  section.innerHTML = `<p class="summary-value">${value}</p>
    <p class="summary-label">${label}</p>`;
  return section;
}
