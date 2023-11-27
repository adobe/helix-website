class ICS {
  constructor() {
    this._data = [];
  }

  addEvent(subject, description, location, begin, stop) {
    // ICS format: https://tools.ietf.org/html/rfc5545
    this._data.push({
      subject,
      description,
      location,
      begin: begin.toISOString().replace(/[-:]/g, '').replace(/\.\d\d\dZ/, 'Z'),
      stop: stop.toISOString().replace(/[-:]/g, '').replace(/\.\d\d\dZ/, 'Z'),
      dtstamp: new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d\d\dZ/, 'Z'),
    });
  }

  toString() {
    const lines = this._data.reduce((acc, event) => {
      acc.push('BEGIN:VEVENT');
      acc.push('CLASS:PUBLIC');
      acc.push(`DESCRIPTION:${event.description}`);
      acc.push(`DTSTART:${event.begin}`);
      acc.push(`DTSTAMP:${event.dtstamp}`);
      acc.push('UID:' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
      acc.push('SEQUENCE:0');
      acc.push(`DTEND:${event.stop}`);
      acc.push(`LOCATION:${event.location}`);
      acc.push(`SUMMARY;LANGUAGE=en-us:${event.subject}`);
      acc.push('TRANSP:TRANSPARENT');
      acc.push('END:VEVENT');
      return acc;
    }, ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//aem.live//helix//EN']);

    lines.push('END:VCALENDAR');

    return lines.join('\n');
  }

}

function decorateTimestamps(element) {
  // find all u, b, strong, em, i elements
  const elements = element.querySelectorAll('u, b, strong, em, i');
  // filter down to the ones that look like timestamps in the YYYY-MM-DD HH:MM format
  const timestamps = Array.from(elements).filter(
    (el) => el.textContent.match(/^\d\d\d\d-\d\d-\d\d \d\d:\d\d$/),
  );
  // turn them into time elements, but assume they are in UTC
  timestamps.forEach((el) => {
    const timeEl = document.createElement('time');
    const date = new Date(`${el.textContent} UTC`);
    timeEl.setAttribute('datetime', date.toISOString());
    // format contents in local time, using the browser's timezone
    // but do not show seconds
    timeEl.textContent = date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'long',
    });
    // set a title attribute with the UTC time
    const cities = {
      'San Jose, CA': 'America/Los_Angeles',
      'New York, NY': 'America/New_York',
      'London, UK': 'Europe/London',
      'Basel, Switzerland': 'Europe/Zurich',
      'Noida, India': 'Asia/Kolkata',
    };

    timeEl.setAttribute('title',
      Object.entries(cities).reduce((acc, [city, timezone]) => {
        return '' + acc + '\n' + city + ': ' + date.toLocaleString('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }, '')
    );
    el.replaceWith(timeEl);

    // traverse up the dom until we find an element that has a h1, h2, h3, h4, h5, or h6 child
    let container = timeEl.parentElement;
    while (container && !container.querySelector('h1, h2, h3, h4, h5, h6')) {
      container = container.parentElement;
    }
    const heading = container?.querySelector('h1, h2, h3, h4, h5, h6');

    // find a sibling element that is a link
    const link = timeEl.parentElement.querySelector('a[href]');

    // if we found a heading and a link, create a downloadable ics file
    if (heading && link) {
      const ics = new ICS();
      ics.addEvent(heading.textContent, heading.parentElement.textContent, link.href, date, new Date(date.getTime() + 60 * 60 * 1000));
      const blob = new Blob([ics.toString()], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const download = document.createElement('a');
      download.classList.add('ics');
      download.setAttribute('href', url);
      download.setAttribute('download', heading.textContent + '.ics');
      download.textContent = 'add to calendar';
      // add a space before the download link
      timeEl.parentElement.append(document.createTextNode(' '));
      timeEl.parentElement.append(download);
    }
  });
}

export default function timeDecorator() {
  decorateTimestamps(document);
}