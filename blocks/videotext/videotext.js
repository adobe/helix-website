export default function decorate(block) {
  [...block.children].forEach((row) => {
    const videoEl = [...row.children][0];
    videoEl.classList.add('videocontent');
    const videoURL = videoEl.innerHTML;
    videoEl.innerHTML = `<video playsinline controls name="media"><source src="${videoURL}" type="video/mp4"></video>`;
    const textEl = [...row.children][1];
    textEl.classList.add('text');
    textEl.querySelectorAll('a').forEach((a) => {
      a.target = '_blank';
    });
  });
}
