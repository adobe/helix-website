/**
 * Parse ISO 8601 timestamp format
 * @param {string} timestamp - ISO timestamp string
 * @returns {Date} Parsed date object
 */
const parseIncidentTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (!Number.isNaN(date.getTime())) {
    return date;
  }
  return new Date(timestamp);
};

/**
 * Calculate uptime based on incidents in the last 90 days
 * @param {Array} incidents - Array of incident objects
 * @returns {Object} Status object with uptime calculations
 */
const calculateUptime = (incidents) => {
  const status = {};
  [
    ['delivery', 0.9999],
    ['publishing', 0.999],
  ].forEach(([service, sla]) => {
    status[service] = {
      sla,
      uptime: 1,
      numIncidents: 0,
      disruptionMins: 0,
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

      if (status[impactedService]) {
        status[impactedService].uptime = Math.min(
          status[impactedService].uptime,
          status[impactedService].uptime - (downtimeMins / ninetyDaysMins),
        );
        status[impactedService].numIncidents += 1;
        status[impactedService].disruptionMins += disruptionMins;
      }
    });

  Object.entries(status).forEach(([, serviceStatus]) => {
    // format uptime percentage to 2 decimal places
    // toFixed(2) rounds 99.99 up to 100.00, fall back to string slicing
    serviceStatus.uptimePercentage = `${(serviceStatus.uptime * 100)}`.slice(0, 6);
  });

  return status;
};

/**
 * Fetch incidents from aemstatus.net
 * @returns {Promise<Array>} Array of incidents
 */
const fetchIncidents = async () => {
  try {
    const response = await fetch('https://www.aemstatus.net/incidents/index.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch incidents: ${response.statusText}`);
    }
    const incidents = await response.json();
    return incidents;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching incidents:', error);
    return [];
  }
};

/**
 * Create a service row element
 * @param {string} serviceName - Name of the service
 * @param {Object} serviceData - Service data object
 * @returns {HTMLElement} Service row element
 */
const createServiceRow = (serviceName, serviceData) => {
  const row = document.createElement('div');
  row.className = 'service-row';

  const nameCell = document.createElement('div');
  nameCell.className = 'service-name';
  nameCell.textContent = `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Service SLO`;

  const valueCell = document.createElement('div');
  valueCell.className = 'service-value';

  const actualValue = document.createElement('span');
  actualValue.className = 'actual-uptime';
  actualValue.textContent = `${serviceData.uptimePercentage}%`;

  // Add status class based on comparison with SLA
  if (serviceData.uptime >= serviceData.sla) {
    actualValue.classList.add('ok');
  } else if (serviceData.uptime >= serviceData.sla - (1 - serviceData.sla)) {
    actualValue.classList.add('warn');
  } else {
    actualValue.classList.add('err');
  }

  const targetValue = document.createElement('span');
  targetValue.className = 'target-slo';
  targetValue.textContent = ` (Target: ${(serviceData.sla * 100).toFixed(2)}%)`;

  valueCell.appendChild(actualValue);
  valueCell.appendChild(targetValue);

  const incidentsCell = document.createElement('div');
  incidentsCell.className = 'service-incidents';
  incidentsCell.textContent = `${serviceData.numIncidents} incident${serviceData.numIncidents === 1 ? '' : 's'} in last 90 days`;

  row.appendChild(nameCell);
  row.appendChild(valueCell);
  row.appendChild(incidentsCell);

  return row;
};

/**
 * Decorates the service level objectives block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Show loading state
  block.innerHTML = '<div class="loading">Loading service level data...</div>';

  try {
    // Fetch incidents
    const incidents = await fetchIncidents();

    // Calculate uptime
    const status = calculateUptime(incidents);

    // Clear loading state
    block.innerHTML = '';

    // Add header
    const header = document.createElement('div');
    header.className = 'slo-header';
    header.innerHTML = '<div class="slo-period">90-Day Actual Uptime</div>';
    block.appendChild(header);

    // Create service rows
    Object.entries(status).forEach(([serviceName, serviceData]) => {
      const row = createServiceRow(serviceName, serviceData);
      block.appendChild(row);
    });

    // Add footer note
    const footer = document.createElement('div');
    footer.className = 'slo-footer';
    footer.innerHTML = '<p>Data source: <a href="https://www.aemstatus.net" target="_blank" rel="noopener">AEM Status</a></p>';
    block.appendChild(footer);

    block.classList.add('loaded');
  } catch (error) {
    block.innerHTML = '<div class="error">Unable to load service level data. Please try again later.</div>';
    // eslint-disable-next-line no-console
    console.error('Error decorating service level objectives block:', error);
  }
}
