// eslint-disable-next-line import/no-unresolved
import { calculateUptime, getUptimeStatus } from 'https://www.aemstatus.net/scripts/slo-calculator.js';

export default async function decorate(block) {
  try {
    const response = await fetch('https://www.aemstatus.net/incidents/index.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch incidents: ${response.status}`);
    }

    const incidents = await response.json();
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
        <p>${serviceStatus.numIncidents} incident${serviceStatus.numIncidents === 1 ? '' : 's'}</p>
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
