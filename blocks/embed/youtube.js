const init = (element) => {
  const url = new URL(element.href);
  const vid = url.searchParams.get('v');
  const html = `<div class="youtube-wrapper">
        <iframe src="https://www.youtube.com/embed/${vid}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen="" scrolling="no" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  element.parentElement.insertAdjacentHTML('afterend', html);
  element.parentElement.remove();
};

export default init;
