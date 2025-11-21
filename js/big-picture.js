// big-picture.js
// Модуль отвечает только за открытие/закрытие и заполнение окна .big-picture

const bigPicture = document.querySelector('.big-picture');
const bigPictureImg = bigPicture.querySelector('.big-picture__img img');
const likesCountEl = bigPicture.querySelector('.likes-count');
const commentsCountEl = bigPicture.querySelector('.comments-count');
const commentsListEl = bigPicture.querySelector('.social__comments');
const descriptionEl = bigPicture.querySelector('.social__caption');
const commentCountBlock = bigPicture.querySelector('.social__comment-count');
const commentsLoader = bigPicture.querySelector('.comments-loader');
const closeBtn = bigPicture.querySelector('.big-picture__cancel');

const MAX_COMMENTS_PER_BATCH = 5;

let totalComments = [];
let loadedCommentCount = 0;
let onEscKeyDown = null;

/**
 * Создаёт DOM-элемент комментария по объекту {avatar, name, message}
 */
function createCommentElement(comment) {
  const li = document.createElement('li');
  li.className = 'social__comment';

  const img = document.createElement('img');
  img.className = 'social__picture';
  img.src = comment.avatar;
  img.alt = comment.name;
  img.width = 35;
  img.height = 35;

  const p = document.createElement('p');
  p.className = 'social__text';
  p.textContent = comment.message;

  li.appendChild(img);
  li.appendChild(p);

  return li;
}

/**
 * Открывает полноэкранное окно и заполняет его данными photo
 */
export function showFullView(photo) {
  // Заполняем основные поля
  bigPictureImg.src = photo.url;
  bigPictureImg.alt = photo.description || '';
  likesCountEl.textContent = String(photo.likes !== undefined ? photo.likes : 0);
  commentsCountEl.textContent = String((photo.comments && photo.comments.length) || 0);
  descriptionEl.textContent = photo.description || '';

  // Очищаем и добавляем комментарии
  commentsListEl.innerHTML = '';
  totalComments = photo.comments;
  loadedCommentCount = 0;

  // показать блоки
  commentCountBlock.classList.remove('hidden');
  commentsLoader.classList.remove('hidden');

  // первая порция
  displayComments();

  // Показать окно
  bigPicture.classList.remove('hidden');
  document.body.classList.add('modal-open');

  commentsLoader.addEventListener('click', displayComments);

  // Обработчики закрытия
  const onCloseClick = () => hideFullView();
  closeBtn.addEventListener('click', onCloseClick);

  onEscKeyDown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      hideFullView();
    }
  };
  document.addEventListener('keydown', onEscKeyDown);

  // Сохраняем ссылку на текущ обработчик, чтобы удалить при закрытии
  // onCloseClick удаляется в hideFullView через замыкание
  // Для безопасности возвращаем функцию закрытия, если потребуется:
  return () => hideFullView();
}

/**
 * Закрывает окно и убирает обработчики
 */
export function hideFullView() {
  // Если окно уже скрыто — ничего не делаем
  if (bigPicture.classList.contains('hidden')) {
    return;
  }

  bigPicture.classList.add('hidden');
  document.body.classList.remove('modal-open');

  // Удаляем обработчики
  closeBtn.removeEventListener('click', hideFullView);
  if (onEscKeyDown) {
    document.removeEventListener('keydown', onEscKeyDown);
    onEscKeyDown = null;
  }

  commentsLoader.removeEventListener('click', displayComments);

  // Очищаем содержимое (чтобы при следующем открытии не было мигания старых данных)
  commentsListEl.innerHTML = '';
  commentCountBlock.classList.add('hidden');
  commentsLoader.classList.add('hidden');
}


function displayComments() {
  const nextBatch = totalComments.slice(
    loadedCommentCount,
    loadedCommentCount + MAX_COMMENTS_PER_BATCH
  );

  nextBatch.forEach((comment) => {
    const li = createCommentElement(comment);
    commentsListEl.appendChild(li);
  });

  loadedCommentCount += nextBatch.length;

  commentsCountEl.textContent = totalComments.length;
  commentCountBlock.textContent = `${loadedCommentCount} из ${totalComments.length} комментариев`;

  if (loadedCommentCount >= totalComments.length) {
    commentsLoader.classList.add('hidden');
  }
}

