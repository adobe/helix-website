export default async function decorate(block) {
  try {
    const [{ calculateUptime, getUptimeStatus }, { default: incidents }] = await Promise.all([
      // eslint-disable-next-line import/no-unresolved
      import('https://www.aemstatus.net/scripts/slo-calculator.js'),
      fetch('https://www.aemstatus.net/incidents/index.json').then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch incidents: ${r.status}`);
        return r.json();
      }).then((data) => ({ default: data })),
    ]);

    const status = calculateUptime(incidents);

    block.innerHTML = '';

    Object.entries(status).forEach(([service, serviceStatus]) => {
      const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
      const serviceDiv = document.createElement('div');
      serviceDiv.className = `service ${service}`;

      const sloDiv = document.createElement('div');
      sloDiv.className = 'slo';
      sloDiv.innerHTML = `
        <h4>${serviceName} Service SLO</h4>
        <p>${(serviceStatus.sla * 100).toFixed(2)}%</p>
      `;

      const uptimeDiv = document.createElement('div');
      uptimeDiv.className = 'uptime';

      const uptimeClass = getUptimeStatus(serviceStatus.uptime, serviceStatus.sla);
      uptimeDiv.classList.add(uptimeClass);

      uptimeDiv.innerHTML = `
        <h4>90-Day Uptime: ${serviceStatus.uptimePercentage}%</h4>
        <p><a href="https://www.aemstatus.net">${serviceStatus.numIncidents} incident${serviceStatus.numIncidents === 1 ? '' : 's'}</a></p>
      `;

      serviceDiv.appendChild(sloDiv);
      serviceDiv.appendChild(uptimeDiv);
      block.appendChild(serviceDiv);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading service level objectives:', error);
    block.innerHTML = '<p>Unable to load current service statistics. Please check <a href="https://www.aemstatus.net">aemstatus.net</a> for the latest information.</p>';
  }
}
