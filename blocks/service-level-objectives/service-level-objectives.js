function parseIncidentTimestamp(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calculateUptime(incidents) {
  const status = {};
  [
    ['delivery', 0.9999],
    ['publishing', 0.999],
  ].forEach(([service, sla]) => {
    status[service] = {
      sla,
      uptime: 1,
      numIncidents: 0,
    };
  });

  const ninetyDaysMins = 90 * 24 * 60;
  const ninetyDaysMillies = ninetyDaysMins * 60 * 1000;

  incidents
    .map((incident) => ({
      startTime: parseIncidentTimestamp(incident.startTime),
      endTime: parseIncidentTimestamp(incident.endTime),
      impactedService: incident.impactedService,
      errorRate: parseFloat(incident.errorRate) || 0,
    }))
    .filter(({
      startTime, endTime, impactedService, errorRate,
    }) => startTime && endTime && impactedService && errorRate)
    .filter(({ startTime }) => startTime > new Date(Date.now() - ninetyDaysMillies))
    .forEach(({
      startTime, endTime, impactedService, errorRate,
    }) => {
      const disruptionMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      const downtimeMins = disruptionMins * errorRate;
      const uptimeMins = ninetyDaysMins - downtimeMins;
      const uptime = uptimeMins / ninetyDaysMins;

      status[impactedService].uptime = uptime;
      status[impactedService].numIncidents += 1;
    });

  Object.entries(status).forEach(([, serviceStatus]) => {
    // eslint-disable-next-line no-param-reassign
    serviceStatus.uptimePercentage = `${(serviceStatus.uptime * 100)}`.slice(0, 6);
  });

  return status;
}

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

      let uptimeClass = 'ok';
      if (serviceStatus.uptime < serviceStatus.sla) {
        uptimeClass = 'err';
      } else if (serviceStatus.uptime < serviceStatus.sla * 1.001) {
        uptimeClass = 'warn';
      }
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
