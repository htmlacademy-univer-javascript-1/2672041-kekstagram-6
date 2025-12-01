import { renderThumbnails } from './thumbnails.js';
import { loadPhotos } from './api.js';

const filtersBlock = document.querySelector('.img-filters');
const picturesContainer = document.querySelector('.pictures');
const errorTemplate = document.querySelector('#error').content.querySelector('.error');


function showDataLoadError(message) {
  const clone = errorTemplate.cloneNode(true);
  const title = clone.querySelector('.error__title');
  if (title) {
    title.textContent = message || 'Ошибка загрузки изображений';
  }
  picturesContainer.innerHTML = '';
  picturesContainer.appendChild(clone);
  const btn = clone.querySelector('.error__button');
  if (btn) {
    btn.addEventListener('click', () => {
      window.location.reload();
    });
  }
}

loadPhotos()
  .then((photos) => {
    if (filtersBlock) {
      filtersBlock.classList.remove('img-filters--inactive');
    }
    renderThumbnails(photos);
  })
  .catch(() => {
    showDataLoadError('Не удалось загрузить фотографии. Попробуйте перезагрузить страницу.');
  });
