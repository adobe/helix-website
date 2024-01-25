/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/** Component that displays for how long its been visible.
 *  Based on the MDN example at 
 *  https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API/Timing_element_visibility
 */

class VisibleFor extends HTMLElement {
  constructor() {
    super();
    this.visible = true;
  }

  connectedCallback() {
    this.dataset.visibleFor = 0;
    this.render();
    this.timerID = setInterval(this.everySecond.bind(this), 1000);
    new IntersectionObserver(this.observerCallback.bind(this)).observe(this);
  }

  disconnectedCallback() {
    if(this.timerID) {
      clearInterval(this.timerID);
    }
  }

  observerCallback(entries) {
    let newVisible = false;
    entries.forEach(e => {
      if(e.isIntersecting) {
        newVisible = true;
      }
    });
    this.visible = newVisible;
    console.log(`Visible: ${this.visible}`);
  }

  everySecond() {
    if(this.visible && document.visibilityState == 'visible') {
      this.dataset.visibleFor = Number(this.dataset.visibleFor) + 1;
      this.render();
    }
  }

  render() {
    this.textContent = this.dataset.visibleFor;
  }
}

customElements.define('visible-for', VisibleFor);