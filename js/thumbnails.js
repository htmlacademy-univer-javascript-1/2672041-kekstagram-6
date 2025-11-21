const template = document
  .querySelector('#picture')
  .content
  .querySelector('.picture');

const picturesContainer = document.querySelector('.pictures');

/**
 * Создаёт DOM-элемент миниатюры
 */
function createThumbnail(photo) {
  const element = template.cloneNode(true);

  const img = element.querySelector('.picture__img');
  img.src = photo.url;
  img.alt = photo.description;

  element.querySelector('.picture__likes').textContent = photo.likes;
  element.querySelector('.picture__comments').textContent = photo.comments.length;

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
