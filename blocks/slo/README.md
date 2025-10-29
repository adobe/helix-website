# Service Level Objective (SLO) Block

The SLO block calculates and displays actual service levels based on incident data from the AEM Status API.

## Usage

Add the SLO block to any page where you want to display actual service levels:

```html
<div class="slo">
  <!-- Block will be automatically decorated -->
</div>
```

## Features

- **Real-time data**: Fetches incident data from https://www.aemstatus.net/incidents/index.json
- **Accurate calculations**: Uses the same algorithm as the AEM Status website
- **90-day uptime**: Calculates uptime for the past 90 days for both services
- **Service coverage**: 
  - Delivery Service (99.99% SLO)
  - Publishing Service (99.9% SLO)
- **Visual indicators**: Color-coded status based on SLA compliance
- **Responsive design**: Works on all device sizes
- **Accessibility**: Semantic HTML and proper ARIA labels

## Algorithm

The block calculates uptime using the same approach as adobe/aem-status:

1. Filter incidents from the last 90 days
2. Calculate disruption time for each incident using `(end_time - start_time) * error_rate`
3. Apply the worst-case uptime calculation for each service
4. Display the final uptime percentage and incident count

## Implementation

The block consists of:
- `blocks/slo/slo.js` - Main logic for fetching data and calculations
- `blocks/slo/slo.css` - Responsive styling and visual indicators

## Example Output

```
Actual Service Level Objectives
Based on the last 90 days of incident data

[Delivery Service: 99.97%]     2 incidents in the last 90 days
SLO: 99.99%

[Publishing Service: 99.85%] 3 incidents in the last 90 days  
SLO: 99.9%
```

The block will show visual indicators (green for meeting SLA, yellow for falling short) to help users quickly understand service health.
