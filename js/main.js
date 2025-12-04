import { renderThumbnails } from './thumbnails.js';
import { loadPhotos } from './api.js';

function debounce(callback, timeoutDelay = 500) {
  let timeoutId;
  return (...rest) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(this, rest), timeoutDelay);
  };
}

const filtersBlock = document.querySelector('.img-filters');
const picturesContainer = document.querySelector('.pictures');
const errorTemplate = document.querySelector('#error').content.querySelector('.error');

const filterDefaultBtn = document.getElementById('filter-default');
const filterRandomBtn = document.getElementById('filter-random');
const filterDiscussedBtn = document.getElementById('filter-discussed');

function showDataLoadError(message) {
  const clone = errorTemplate.cloneNode(true);
  const title = clone.querySelector('.error__title');
  if (title) {
    title.textContent = message || 'Ошибка загрузки изображений';
  }

  const existing = picturesContainer.querySelectorAll('.picture');
  existing.forEach((el) => el.remove());

  picturesContainer.appendChild(clone);
  const btn = clone.querySelector('.error__button');
  if (btn) {
    btn.addEventListener('click', () => {
      window.location.reload();
    });
  }
}

function clearThumbnails() {
  const existing = picturesContainer.querySelectorAll('.picture');
  existing.forEach((el) => el.remove());
}

// Возвращает 10 случайных элементов без повторов
function pickRandomUnique(list, count = 10) {
  const copy = Array.from(list);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

// Применяет выбранный фильтр
function applyFilter(photos, filterType) {
  clearThumbnails();

  let toRender;
  switch (filterType) {
    case 'random':
      toRender = pickRandomUnique(photos, 10);
      break;
    case 'discussed':
      toRender = Array.from(photos).sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      break;
    case 'default':
    default:
      toRender = photos;
  }

  renderThumbnails(toRender);
}

// Устанавливаем визуально активную кнопку фильтра
function setActiveButton(activeBtn) {
  if (!filtersBlock) return;
  const buttons = filtersBlock.querySelectorAll('.img-filters__button');
  buttons.forEach((b) => b.classList.remove('img-filters__button--active'));
  if (activeBtn) {
    activeBtn.classList.add('img-filters__button--active');
  }
}

// Инициализация
loadPhotos()
  .then((photos) => {
    if (filtersBlock) {
      filtersBlock.classList.remove('img-filters--inactive');
    }

    let originalPhotos = Array.isArray(photos) ? photos : [];

    applyFilter(originalPhotos, 'default');

    const debouncedApply = debounce((type, button) => {
      setActiveButton(button);
      applyFilter(originalPhotos, type);
    }, 500);

    if (filterDefaultBtn) {
      filterDefaultBtn.addEventListener('click', () => {
        debouncedApply('default', filterDefaultBtn);
      });
    }
    if (filterRandomBtn) {
      filterRandomBtn.addEventListener('click', () => {
        debouncedApply('random', filterRandomBtn);
      });
    }
    if (filterDiscussedBtn) {
      filterDiscussedBtn.addEventListener('click', () => {
        debouncedApply('discussed', filterDiscussedBtn);
      });
    }

    document.addEventListener("photo:uploaded", (evt) => {
      const newPhoto = evt.detail;
      if (!newPhoto) return;

      // Добавляем в общий массив
      originalPhotos.unshift(newPhoto);

      // Определяем текущий выбранный фильтр
      const activeBtn = filtersBlock.querySelector('.img-filters__button--active');
      const filterType =
        activeBtn?.id === 'filter-random'
          ? 'random'
          : activeBtn?.id === 'filter-discussed'
            ? 'discussed'
            : 'default';

      applyFilter(originalPhotos, filterType);
    });
  })
  .catch(() => {
    showDataLoadError('Не удалось загрузить фотографии. Попробуйте перезагрузить страницу.');
  });
