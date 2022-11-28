export default function decorate(block) {
  [...block.children].forEach((row) => {
    const videoEl = [...row.children][0];
    videoEl.classList.add('videocontent');
    /*
    const videoURL = videoEl.innerHTML;
    videoEl.innerHTML = videoURL;
    */
    const textEl = [...row.children][1];
    textEl.classList.add('text');
    textEl.querySelectorAll('a').forEach((a) => {
      a.target = '_blank';
    });
  });
}
