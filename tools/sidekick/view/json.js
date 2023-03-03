/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const nearFuture = new Date().setUTCFullYear(new Date().getUTCFullYear() + 20);
const recentPast = new Date().setUTCFullYear(new Date().getUTCFullYear() - 20);

function drawHeader(table, rowData) {
  const thead = table.appendChild(document.createElement('thead'));
  const row = document.createElement('tr');
  Object.keys(rowData).forEach((key) => {
    const col = document.createElement('th');
    col.textContent = key;
    row.append(col);
  });
  thead.append(row);
}

function drawValue(cell, value) {
  const valueContainer = cell.appendChild(document.createElement('div'));
  if (value && !Number.isNaN(+value)) {
    // check for date
    const date = +value > 99999
      ? new Date(+value * 1000)
      : new Date(Math.round((+value - (1 + 25567 + 1)) * 86400 * 1000)); // excel date
    if (date.toString() !== 'Invalid Date'
      && nearFuture > date.valueOf() && recentPast < date.valueOf()) {
      valueContainer.classList.add('date');
      valueContainer.textContent = date.toUTCString();
    } else {
      // number
      valueContainer.classList.add('number');
      valueContainer.textContent = value;
    }
  } else if (value.startsWith('/') || value.startsWith('http')) {
    // assume link
    const link = valueContainer.appendChild(document.createElement('a'));
    link.href = value;
    link.title = value;
    link.target = '_blank';
    if (value.includes('media_')) {
      // linked image
      valueContainer.classList.add('image');
      const img = link.appendChild(document.createElement('img'));
      img.src = value;
    } else {
      // text link
      link.textContent = value;
    }
  } else if (value.startsWith('[') && value.endsWith(']')) {
    // assume array
    valueContainer.classList.add('list');
    const list = valueContainer.appendChild(document.createElement('ul'));
    JSON.parse(value).forEach((v) => {
      const item = list.appendChild(document.createElement('li'));
      item.textContent = v;
    });
  } else {
    // text
    valueContainer.textContent = value;
  }
}

function drawBody(table, data) {
  const tbody = table.appendChild(document.createElement('tbody'));
  data.forEach((set) => {
    const row = document.createElement('tr');
    Object.keys(set).forEach((key) => {
      const cell = document.createElement('td');
      drawValue(cell, set[key]);
      row.append(cell);
    });
    tbody.append(row);
  });
}

export default function draw(viewContainer, rawData) {
  const json = JSON.parse(rawData);
  const sheets = {};
  if (json[':type'] === 'multi-sheet' && json[':names']) {
    json[':names'].forEach((name) => {
      const { data } = json[name];
      if (data && data.length > 0) {
        sheets[name] = data;
      }
    });
  } else {
    const { data } = json;
    if (data && data.length > 0) {
      sheets['helix-default'] = data;
    }
  }
  Object.keys(sheets).forEach((name) => {
    const sheet = sheets[name];
    const title = viewContainer.appendChild(document.createElement('h2'));
    title.textContent = name;
    const table = viewContainer.appendChild(document.createElement('table'));
    drawHeader(table, sheet[0]);
    drawBody(table, sheet);
  });
}
