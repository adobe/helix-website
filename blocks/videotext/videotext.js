export default function decorate(block) {
  const blockElements = Array.from(block.children);
  const embedUrl = blockElements[0].innerText.split('/')[4];
  const videotextBlock = document.createElement('div');
  const embedHTML = `<iframe src="https://web.microsoftstream.com/embed/video/${embedUrl}" 
  style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
  frameborder="0" allow="autoplay; fullscreen; picture-in-picture"  
  title="Content from MS Stream" loading="lazy"></iframe>`;
  block.innerHTML = '';
  const embedStream = document.createElement('div');
  embedStream.className = 'video-stream';
  videotextBlock.append(embedStream);
  embedStream.innerHTML = embedHTML;
  const faq = blockElements[1];
  const embedFAQ = document.createElement('div');
  embedFAQ.className = 'video-faq';
  videotextBlock.append(embedFAQ);
  embedFAQ.innerHTML = faq.innerHTML;
  block.append(videotextBlock);
}
