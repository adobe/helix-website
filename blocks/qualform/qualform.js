const formHTML = `<div class="rendered-form">
    <div class="">
        <h1>Project Helix SC Opportunity Qualification Questions</h1>
    </div>
    <div class="form-group field-scEmail">
        <label for="scEmail" class="text-label">SC Email Address<span class="required">*</span></label>
        <input type="email" class="form-control" name="scEmail" access="false" id="scEmail" required="required" aria-required="true">
    </div>
    <h2>Customer Info</h2>
    <div class="form-group field-customerName">
        <label for="customerName" class="text-label">Customer Name<span class="required">*</span></label>
        <input type="text" class="form-control" name="customerName" access="false" id="customerName" required="required" aria-required="true">
    </div>
    <div class="form-group field-customerDivision">
        <label for="customerDivision" class="text-label">Specific Division, if applicable (e.g. Recruiting)</label>
        <input type="text" class="form-control" name="customerDivision" access="false" id="customerDivision">
    </div>
    <div class="form-group field-drAssociated">
        <label for="drAssociated">Is there a DR associated with this opportunity?<span class="required">*</span></label>
        <select class="form-control" name="drAssociated" id="drAssociated" required="required" aria-required="true">
            <option value="unknown" selected="true" id="drAssociated-0">Don't Know</option>
            <option value="yes" id="drAssociated-1">Yes</option>
            <option value="no" id="drAssociated-2">No</option>
        </select>
    </div>
    <div class="form-group field-goals">
        <label for="goals" class="textarea-label">What are the customer’s current goals around experience creation and delivery?&nbsp;<span class="required">*</span></label>
        <textarea type="textarea" class="form-control" name="goals" access="false" id="goals" required="required" aria-required="true"></textarea>
    </div>
    <div class="form-group field-quickStandUp">
        <label for="quickStandUp">Do they have immediate needs for quick site stand-up?<span class="required">*</span></label>
        <select class="form-control" name="quickStandUp" id="quickStandUp" required="required" aria-required="true">
            <option value="yes" selected="true" id="quickStandUp-0">Yes</option>
            <option value="no" id="quickStandUp-1">No</option>
            <option value="unknown" id="quickStandUp-2">Don't Know</option>
        </select>
    </div>
    <h2>Current Stack</h2>
    <div class="form-group field-challenges">
        <label for="challenges" class="textarea-label">What are their challenges?<span class="required">*</span></label>
        <textarea type="textarea" class="form-control" name="challenges" access="false" id="challenges" required="required" aria-required="true"></textarea>
    </div>
    <div class="form-group field-cms">
        <label for="cms">Which CMS are they currently leveraging?<span class="required">*</span></label>
        <select class="form-control" name="cms" id="cms" required="required" aria-required="true">
            <option value="aemSites" selected="true" id="cms-0">AEM Sites</option>
            <option value="other" id="cms-1">Other</option>
        </select>
    </div>
    <div id="field-aemType" class="form-group">
        <label for="aemType">AEM Deployment</label>
        <select class="form-control" name="aemType" id="aemType">
            <option value="onPrem" selected="true" id="aemType-0">On-Prem</option>
            <option value="cloudServices" id="cloudServices">Cloud Services</option>
            <option value="managedServices" id="managedServices">Managed Services</option>
        </select>
    </div>
    <div id="field-cmsOtherName" class="form-group">
        <label for="cmsOtherName" class="text-label">CMS Product Name</label>
        <input type="text" class="form-control" name="cmsOtherName" access="false" id="cmsOtherName">
    </div>
    <div class="form-group field-migrationUrgency">
        <label for="migrationUrgency" class="text-label">How soon are they looking to move from their current tool?<span class="required">*</span></label>
        <input type="text" class="form-control" name="migrationUrgency" access="false" id="migrationUrgency" required="required" aria-required="true">
    </div>
    <div class="form-group field-webStats">
        <label for="webStats" class="textarea-label">Do you have any web statistics? Current page traffic? Number of domains/sub domains etc.</label>
        <textarea type="textarea" class="form-control" name="webStats" access="false" id="webStats"></textarea>
    </div>
    <h2>Content Authoring</h2>
    <div class="form-group field-currentProcess">
        <label for="currentProcess" class="textarea-label">What does their current content update and experience creation process look like?<span class="required">*</span></label>
        <textarea type="textarea" class="form-control" name="currentProcess" access="false" id="currentProcess" required="required" aria-required="true"></textarea>
    </div>
    <div class="form-group field-updateFrequency">
        <label for="updateFrequency" class="text-label">How often do they update content?<span class="required">*</span></label>
        <input type="text" class="form-control" name="updateFrequency" access="false" id="updateFrequency" required="required" aria-required="true">
    </div>
    <div class="form-group field-contentAuthorsCount">
        <label for="contentAuthorsCount" class="text-label">How many estimated content authors do they have?<span class="required">*</span></label>
        <input type="text" class="form-control" name="contentAuthorsCount" access="false" id="contentAuthorsCount" required="required" aria-required="true">
    </div>
    <div class="form-group field-authorSkillLevel">
        <label for="authorSkillLevel">Average skill level of content authors<span class="required">*</span></label>
        <select class="form-control" name="authorSkillLevel" id="authorSkillLevel" required="required" aria-required="true">
            <option value="beginner" selected="true" id="authorSkillLevel-0">Beginner</option>
            <option value="novice" id="authorSkillLevel-1">Novice</option>
            <option value="advanced" id="authorSkillLevel-2">Advanced</option>
            <option value="expert" id="authorSkillLevel-3">Expert</option>
        </select>
    </div>
    <div class="form-group field-translation">
        <label for="translation" class="textarea-label">Does the customer have translation needs? If so what languages?<span class="required">*</span></label>
        <textarea type="textarea" class="form-control" name="translation" access="false" id="translation" required="required" aria-required="true"></textarea>
    </div>
    <div class="form-group field-assets">
        <label for="assets" class="textarea-label">What kind of assets are on their site? Any dynamic content?<span class="required">*</span></label>
        <textarea type="textarea" class="form-control" name="assets" access="false" id="assets" required="required" aria-required="true"></textarea>
    </div>
    <div class="submit">
      <button type="submit">Submit</button>
    <div>
</div>`
export default function decorate(block) {
  // turn links into buttons
  const form = document.createElement('form');
  form.classList.add('qualform');
  form.innerHTML = formHTML;

  const container = document.querySelector('.qualform');
  container.appendChild(form);


  const aemTypeSelect = document.getElementById('field-aemType');
  const cmsOtherName = document.getElementById('field-cmsOtherName');
  cmsOtherName.style.display = 'none';


  const cmsSelect = document.getElementById('cms');
  cmsSelect.addEventListener('change', function (e) {
    const value = e.target.value;
    if (value === 'other') {
      aemTypeSelect.style.display = 'none';
      cmsOtherName.style.display = 'block';
      return;
    }

    aemTypeSelect.style.display = 'block';
    cmsOtherName.style.display = 'none';
  });


  const submitButton = container.querySelector('button');
  submitButton.addEventListener('click', function (e) {
    e.preventDefault();
    const scEmail = document.getElementById("scEmail").value;
    const customerName = document.getElementById("customerName").value;
    const customerDivision = document.getElementById("customerDivision").value;
    const drAssociated = document.getElementById("drAssociated").value;
    const goals = document.getElementById("goals").value;
    const quickStandUp = document.getElementById("quickStandUp").value;
    const challenges = document.getElementById("challenges").value;
    const cms = document.getElementById("cms").value;
    const aemType = document.getElementById("aemType").value;
    const cmsOtherName = document.getElementById("cmsOtherName").value;
    const migrationUrgency = document.getElementById("migrationUrgency").value;
    const webStats = document.getElementById("webStats").value;
    const currentProcess = document.getElementById("currentProcess").value;
    const contentAuthorsCount = document.getElementById("contentAuthorsCount").value;
    const authorSkillLevel = document.getElementById("authorSkillLevel").value;
    const translation = document.getElementById("translation").value;
    const assets = document.getElementById("assets").value;


    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    const body = {
      data: {
        scEmail,
        customerName,
        customerDivision,
        drAssociated,
        goals,
        quickStandUp,
        challenges,
        cms,
        aemType,
        cmsOtherName,
        migrationUrgency,
        webStats,
        currentProcess,
        contentAuthorsCount,
        authorSkillLevel,
        translation,
        assets
      }
    }

    var requestOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    };

    fetch("https://submission--helix-website--adobe.hlx3.page/sc-qualform", requestOptions)
      .then(response => response.text())
      .then(result => {
        window.location = "https://submission--helix-website--adobe.hlx3.page/submission-complete";
      })
      .catch(error => console.log('error', error));

  });
}
