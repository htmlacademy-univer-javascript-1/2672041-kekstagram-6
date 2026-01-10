import { showFullView } from './big-picture.js';

const template = document
  .querySelector('#picture')
  .content
  .querySelector('.picture');

const picturesContainer = document.querySelector('.pictures');

function computeFilterStyle(effect, intensity) {
  if (!effect || effect === 'none') {
    return '';
  }

  const v = (intensity === null || intensity === undefined || intensity === '') ? null : Number(intensity);

  switch (effect) {
    case 'chrome': // grayscale 0..1 where intensity usually 0..100
      return `grayscale(${v !== null ? (v / 100).toFixed(2) : 1})`;
    case 'sepia':
      return `sepia(${v !== null ? (v / 100).toFixed(2) : 1})`;
    case 'marvin':
      return `invert(${v !== null ? v : 100}%)`;
    case 'phobos': // blur in px (v can be 0..3)
      return `blur(${v !== null ? v : 3}px)`;
    case 'heat': // brightness(1..3) mapped from intensity 1..100 (same mapping as uploader)
      if (v === null) {
        return 'brightness(1)';
      }
      return `brightness(${(1 + (v / 100) * 2).toFixed(2)})`;
    default:
      return '';
  }
}

/**
 * Создаёт DOM-элемент миниатюры
 */
function createThumbnail(photo) {
  const element = template.cloneNode(true);

  const img = element.querySelector('.picture__img');
  img.src = photo.url;
  img.alt = photo.description || '';

  element.querySelector('.picture__likes').textContent = String(photo.likes || 0);
  element.querySelector('.picture__comments').textContent = String((photo.comments && photo.comments.length) || 0);

  // Применяем эффект и масштаб, если они присутствуют в объекте photo
  // (эти поля добавляются при загрузке локальной фотографии в upload-form.js)
  if (photo.effect) {
    const filter = computeFilterStyle(photo.effect, photo.intensity);
    img.style.filter = filter;
    img.style.webkitFilter = filter;
  } else {
    img.style.filter = '';
    img.style.webkitFilter = '';
  }

  if (photo.scale !== undefined && photo.scale !== null) {
    const scaleValue = typeof photo.scale === 'number' ? photo.scale : (Number(photo.scale) || 1);
    img.style.transform = `scale(${scaleValue})`;
  } else {
    img.style.transform = '';
  }

  element.addEventListener('click', (evt) => {
    evt.preventDefault();
    showFullView(photo);
  });

  return element;
}

/**
 * Отрисовывает список миниатюр
 */
export function renderThumbnails(photoList) {
  const fragment = document.createDocumentFragment();

  photoList.forEach((photo) => {
    fragment.appendChild(createThumbnail(photo));
  });

  picturesContainer.appendChild(fragment);
}
