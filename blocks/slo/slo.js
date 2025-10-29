/**
 * Service Level Objective (SLO) block
 * Calculates and displays actual service levels based on incident data
 */

// Helper function to parse ISO 8601 timestamp format
const parseIncidentTimestamp = (timestamp) => {
  // Handle ISO 8601 format: "2024-12-10T02:26:00.000Z"
  const date = new Date(timestamp);
  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  // Fallback to standard date parsing
  return new Date(timestamp);
};

/**
 * Calculate service uptime from incidents data
 * @param {Array} incidents - Array of incident objects
 * @returns {Object} Uptime data for delivery and publishing services
 */
const calculateUptime = (incidents) => {
  const status = {};
  [
    ['delivery', 0.9999],
    ['publishing', 0.999],
  ].forEach(([service, sla]) => {
    status[service] = {
      sla,
      slaPercentage: (sla * 100).toFixed(2),
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
      const uptimeMins = ninetyDaysMins - downtimeMins;
      const uptime = uptimeMins / ninetyDaysMins;

      if (status[impactedService]) {
        status[impactedService].uptime = Math.min(status[impactedService].uptime, uptime);
        status[impactedService].numIncidents += 1;
        status[impactedService].disruptionMins += disruptionMins;
      }
    });

  Object.entries(status).forEach(([, serviceStatus]) => {
    // format uptime percentage to 2 decimal places
    // toFixed(2) rounds 99.99 up to 100.00, fall back to string slicing
    serviceStatus.uptimePercentage = `${(serviceStatus.uptime * 100)}`.slice(0, 6);

    // determine status class based on SLA comparison
    serviceStatus.status = serviceStatus.uptime >= serviceStatus.sla ? 'ok' : 'warn';
  });

  return status;
};

/**
 * Create service status element
 * @param {Object} serviceStatus - Service status data
 * @param {string} serviceName - Name of the service
 * @returns {HTMLElement} Service element
 */
const createServiceElement = (serviceStatus, serviceName) => {
  const serviceEl = document.createElement('div');
  serviceEl.className = `service ${serviceStatus.status}`;

  const headerEl = document.createElement('div');
  headerEl.className = 'service-header';

  const nameEl = document.createElement('h3');
  nameEl.className = 'service-name';
  nameEl.textContent = serviceName;

  const percentageEl = document.createElement('div');
  percentageEl.className = 'uptime-percentage';
  percentageEl.textContent = `${serviceStatus.uptimePercentage}%`;

  headerEl.appendChild(nameEl);
  headerEl.appendChild(percentageEl);

  const detailsEl = document.createElement('div');
  detailsEl.className = 'service-details';

  const incidentsEl = document.createElement('div');
  incidentsEl.className = 'incidents';
  incidentsEl.textContent = `${serviceStatus.numIncidents} incident${serviceStatus.numIncidents === 1 ? '' : 's'} in the last 90 days`;

  const slaEl = document.createElement('div');
  slaEl.className = 'sla';
  slaEl.textContent = `SLO: ${serviceStatus.slaPercentage}%`;

  detailsEl.appendChild(incidentsEl);
  detailsEl.appendChild(slaEl);

  serviceEl.appendChild(headerEl);
  serviceEl.appendChild(detailsEl);

  return serviceEl;
};

/**
 * Load incidents data and calculate SLO
 * @param {HTMLElement} block - The block element
 */
const loadAndCalculateSLO = async (block) => {
  try {
    const response = await fetch('https://www.aemstatus.net/incidents/index.json');
    if (!response.ok) {
      throw new Error('Failed to fetch incidents data');
    }

    const incidents = await response.json();
    const status = calculateUptime(incidents);

    const containerEl = document.createElement('div');
    containerEl.className = 'slo-container';

    const titleEl = document.createElement('h2');
    titleEl.className = 'slo-title';
    titleEl.textContent = 'Actual Service Level Objectives';

    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'slo-subtitle';
    subtitleEl.textContent = 'Based on the last 90 days of incident data';

    const servicesEl = document.createElement('div');
    servicesEl.className = 'services';

    // Create service elements
    const deliveryEl = createServiceElement(status.delivery, 'Delivery Service');
    const publishingEl = createServiceElement(status.publishing, 'Publishing Service');

    servicesEl.appendChild(deliveryEl);
    servicesEl.appendChild(publishingEl);

    containerEl.appendChild(titleEl);
    containerEl.appendChild(subtitleEl);
    containerEl.appendChild(servicesEl);

    block.appendChild(containerEl);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading SLO data:', error);

    const errorEl = document.createElement('div');
    errorEl.className = 'slo-error';
    errorEl.innerHTML = `
      <p>Unable to load service level data. Please try again later.</p>
    `;
    block.appendChild(errorEl);
  }
};

/**
 * Decorates the block with SLO functionality
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Clear existing content
  block.innerHTML = '';

  // Add loading state
  const loadingEl = document.createElement('div');
  loadingEl.className = 'slo-loading';
  loadingEl.innerHTML = '<p>Loading service level data...</p>';
  block.appendChild(loadingEl);

  // Load data and populate block
  await loadAndCalculateSLO(block);
}
