// Работа с формой загрузки/редактирования изображения и валидация Pristine
import { sendForm } from './api.js';

(function () {
  const form = document.querySelector('.img-upload__form');
  let fileInput = form.querySelector('.img-upload__input');
  const overlay = form.querySelector('.img-upload__overlay');
  const body = document.body;
  const cancelBtn = form.querySelector('.img-upload__cancel');
  const scaleValue = form.querySelector('.scale__control--value');
  const previewImage = form.querySelector('.img-upload__preview img');
  const effectsRadios = form.querySelectorAll('.effects__radio');
  const effectLevelContainer = form.querySelector('.img-upload__effect-level');
  const effectLevelValue = form.querySelector('.effect-level__value');
  const effectLevelSliderNode = form.querySelector('.effect-level__slider');
  const hashtagsInput = form.querySelector('.text__hashtags');
  const descriptionInput = form.querySelector('.text__description');
  const submitBtn = form.querySelector('.img-upload__submit');
  const scaleSmallerBtn = form.querySelector('.scale__control--smaller');
  const scaleBiggerBtn = form.querySelector('.scale__control--bigger');

  const messagesTemplate = document.querySelector('#messages')?.content?.querySelector('.img-upload__message');
  const successTemplate = document.querySelector('#success')?.content?.querySelector('.success');
  const errorTemplate = document.querySelector('#error')?.content?.querySelector('.error');

  const DEFAULT_SCALE = 100;
  const DEFAULT_EFFECT = 'none';

  const SCALE_STEP = 25;
  const SCALE_MIN = 25;
  const SCALE_MAX = 100;

  // Настройки эффектов
  const EFFECTS = {
    none: {
      range: { min: 0, max: 100 },
      step: 1,
      css: () => ''
    },
    chrome: {
      range: { min: 0, max: 100 },
      step: 0.01,
      css: (v) => `grayscale(${v / 100})`
    },
    sepia: {
      range: { min: 0, max: 100 },
      step: 0.01,
      css: (v) => `sepia(${v / 100})`
    },
    marvin: {
      range: { min: 0, max: 100 },
      step: 1,
      css: (v) => `invert(${v}%)`
    },
    phobos: {
      range: { min: 0, max: 3 },
      step: 0.01,
      css: (v) => `blur(${v}px)`
    },
    heat: {
      range: { min: 1, max: 100 },
      step: 0.1,
      css: (v) => `brightness(${1 + (v / 100) * 2})`
    }
  };

  // Показываем форму при выборе файла
  function openForm() {
    overlay.classList.remove('hidden');
    body.classList.add('modal-open');
    setScale(DEFAULT_SCALE);
    setEffect(DEFAULT_EFFECT);
    hashtagsInput.focus();
  }

  // Утилиты по масштабу и эффектам
  function setScale(percent) {
    if (scaleValue) {
      const clamped = Math.max(SCALE_MIN, Math.min(SCALE_MAX, percent));
      scaleValue.value = `${clamped}%`;
      previewImage.style.transform = `scale(${clamped / 100})`;
    }
  }

  // Применить эффект
  function applyEffect(effectName, value) {
    if (!previewImage) { return; }
    if (!EFFECTS[effectName]) {
      removePreviewFilter();
      return;
    }
    if (effectName === 'none') {
      removePreviewFilter();
      return;
    }
    const eff = EFFECTS[effectName];
    previewImage.style.filter = eff.css(value);
    previewImage.style.webkitFilter = eff.css(value);
  }

  function setEffect(effectName) {
    effectsRadios.forEach((r) => {
      r.checked = (r.value === effectName);
    });
    removePreviewFilter();
    if (effectLevelContainer) {
      if (effectName === 'none') {
        effectLevelContainer.classList.add('hidden');
      } else {
        effectLevelContainer.classList.remove('hidden');
      }
    }
    if (effectLevelValue) {
      effectLevelValue.value = '';
    }

    // Если слайдер инициализирован, обновим его опции и сбросим на "максимум" эффекта
    if (typeof noUiSlider !== 'undefined' && effectLevelSliderNode) {
      if (effectName === 'none') {
        // скрываем слайдер визуально — опция выше уже добавляет класс hidden
      } else {
        const eff = EFFECTS[effectName];
        const start = eff.range.max;
        if (effectLevelSliderNode.noUiSlider) {
          effectLevelSliderNode.noUiSlider.updateOptions({
            range: { min: eff.range.min, max: eff.range.max },
            step: eff.step,
            start: start
          }, false);
          effectLevelSliderNode.noUiSlider.set(start);
        }
      }
    }
  }

  function removePreviewFilter() {
    if (previewImage) {
      previewImage.style.filter = '';
      previewImage.style.webkitFilter = '';
    }
  }

  // Инициализация noUiSlider
  function initEffectSlider() {
    if (!effectLevelSliderNode) { return; }
    if (typeof noUiSlider === 'undefined') {
      return;
    }

    // Инициализируем с какими-то базовыми настройками — будут обновляться при переключении эффектов
    const initialEffect = DEFAULT_EFFECT;
    const eff = EFFECTS[initialEffect] || { range: { min: 0, max: 100 }, step: 1 };

    // Если слайдер уже создан — удаляем
    if (effectLevelSliderNode.noUiSlider) {
      effectLevelSliderNode.noUiSlider.destroy();
    }

    noUiSlider.create(effectLevelSliderNode, {
      start: eff.range.max,
      connect: 'lower',
      range: {
        min: eff.range.min,
        max: eff.range.max
      },
      step: eff.step,
      // формат: сохраняем числовое значение (как строку), без округления лишнего
      format: {
        to: function (value) {
          // округляем до ровного количества знаков в зависимости от step
          const step = eff.step;
          const precision = (String(step).split('.')[1] || '').length;
          return Number(value.toFixed(precision));
        },
        from: function (value) {
          return Number(value);
        }
      }
    });

    // Обработчик перемещения слайдера
    effectLevelSliderNode.noUiSlider.on('update', (values, handle) => {
      const current = values[handle];
      // effectName — текущий выбранный эффект
      const selected = [...effectsRadios].find((r) => r.checked);
      const effectName = selected ? selected.value : DEFAULT_EFFECT;
      const effCfg = EFFECTS[effectName];

      // Записываем значение в поле для отправки (число)
      if (effectLevelValue) {
        // Для единицы отображения — записываем чистое число (без юнита)
        effectLevelValue.value = String(current);
      }

      // Применяем к preview
      if (effectName === 'none' || !effCfg) {
        removePreviewFilter();
      } else {
        applyEffect(effectName, current);
      }
    });
  }

  // Валидация Pristine
  let pristine = null;
  if (typeof Pristine !== 'undefined') {
    pristine = new Pristine(form, {
      classTo: 'img-upload__field-wrapper',
      errorTextParent: 'img-upload__field-wrapper',
      errorTextClass: 'form-error-text',
    });
  }

  function onFileChange() {
    if (!fileInput.files?.length) return;

    const file = fileInput.files[0];
    const url = URL.createObjectURL(file);

    previewImage.src = url;

    const effectPreviews = form.querySelectorAll('.effects__preview');
    effectPreviews.forEach((el) => {
      el.style.backgroundImage = `url("${url}")`;
    });

    openForm();
  }

  fileInput.addEventListener('change', onFileChange);

  // Закрываем и сбрасываем
  function closeForm() {
    form.reset();

    fileInput.value = '';

    setScale(DEFAULT_SCALE);
    setEffect(DEFAULT_EFFECT);
    removePreviewFilter();

    previewImage.src = 'img/upload-default-image.jpg';
    previewImage.style.transform = '';
    previewImage.style.filter = '';
    previewImage.style.webkitFilter = '';

    const effectPreviews = form.querySelectorAll('.effects__preview');
    effectPreviews.forEach((el) => {
      el.style.backgroundImage = '';
      el.style.backgroundSize = '';
      el.style.backgroundPosition = '';
      el.style.backgroundRepeat = '';
    });

    overlay.classList.add('hidden');
    body.classList.remove('modal-open');

    if (pristine) pristine.reset();

    if (effectLevelSliderNode && effectLevelSliderNode.noUiSlider) {
      const eff = EFFECTS[DEFAULT_EFFECT];
      effectLevelSliderNode.noUiSlider.set(eff.range.max);
    }
  }

  // Парсер строки тегов массив чистых тегов
  function parseTags(input) {
    if (!input) {return [];}
    return input
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function isValidTagFormat(tag) {
    if (tag[0] !== '#') {return false;}
    if (tag.length === 1) {return false;}
    if (tag.length > 20) {return false;}
    return /^[\p{L}\p{N}]+$/u.test(tag.slice(1));
  }

  function validateHashtags(value) {
    const tags = parseTags(value);
    if (tags.length === 0) {return true;}

    if (tags.length > 5) {
      validateHashtags.lastError = 'Нельзя указать больше пяти хэш-тегов.';
      return false;
    }

    for (const t of tags) {
      if (!isValidTagFormat(t)) {
        validateHashtags.lastError = `Неверный формат тега "${t}". Тег должен начинаться с # и содержать только буквы и цифры, длина до 20 символов.`;
        return false;
      }
    }

    const lowered = tags.map((t) => t.toLowerCase());
    const unique = new Set(lowered);
    if (unique.size !== lowered.length) {
      validateHashtags.lastError = 'Один и тот же хэш-тег не может быть использован дважды.';
      return false;
    }

    return true;
  }

  function hashtagsErrorMessage() {
    return validateHashtags.lastError || 'Неверный формат хэш-тегов.';
  }

  function validateDescription(value) {
    if (value.length <= 140) {return true;}
    return false;
  }

  function showLoadingMessage() {
    if (!messagesTemplate) return null;
    const node = messagesTemplate.cloneNode(true);
    node.classList.add('img-upload__message--active');
    form.appendChild(node);
    return node;
  }

  function removeLoadingMessage(node) {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  function showModalMessage(cloneNode) {
    if (!cloneNode) return null;
    body.appendChild(cloneNode);
    return cloneNode;
  }

  function closeModalMessage(modalNode) {
    if (!modalNode) return;
    modalNode.remove();
  }

  function setupModalCloseHandlers(modalNode, buttonSelector) {
    if (!modalNode) return () => {};
    const onDocumentKey = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        closeModalMessage(modalNode);
        document.removeEventListener('keydown', onDocumentKey);
        modalNode.removeEventListener('click', onOutsideClick);
      }
    };
    const onOutsideClick = (evt) => {
      if (!evt.target.closest('.' + modalNode.classList[0])) {
        closeModalMessage(modalNode);
        document.removeEventListener('keydown', onDocumentKey);
        modalNode.removeEventListener('click', onOutsideClick);
      }
    };
    const btn = modalNode.querySelector(buttonSelector);
    const onBtn = () => {
      closeModalMessage(modalNode);
      document.removeEventListener('keydown', onDocumentKey);
      modalNode.removeEventListener('click', onOutsideClick);
      if (btn) btn.removeEventListener('click', onBtn);
    };
    if (btn) btn.addEventListener('click', onBtn);
    document.addEventListener('keydown', onDocumentKey);
    modalNode.addEventListener('click', onOutsideClick);
    return () => {
      document.removeEventListener('keydown', onDocumentKey);
      modalNode.removeEventListener('click', onOutsideClick);
      if (btn) btn.removeEventListener('click', onBtn);
    };
  }

  if (pristine) {
    pristine.addValidator(hashtagsInput, validateHashtags, hashtagsErrorMessage);
    pristine.addValidator(descriptionInput, validateDescription, 'Длина комментария не может превышать 140 символов.');
  }

  cancelBtn.addEventListener('click', (evt) => {
    evt.preventDefault();
    closeForm();
  });

  function onDocumentKeydown(evt) {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      if (overlay.classList.contains('hidden')) {return;}
      closeForm();
    }
  }
  document.addEventListener('keydown', onDocumentKeydown);

  [hashtagsInput, descriptionInput].forEach((el) => {
    el.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.stopPropagation();
      }
    });
  });

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();

    if (pristine) {
      const valid = pristine.validate();
      if (!valid) {
        const firstError = form.querySelector('.form-error-text');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    submitBtn.disabled = true;
    const loadingNode = showLoadingMessage();

    const fd = new FormData(form);

    sendForm(fd)
      .then(() => {
        removeLoadingMessage(loadingNode);
        submitBtn.disabled = false;

        // Создаём локальный объект нового фото
        const file = fileInput.files[0];
        const localUrl = URL.createObjectURL(file);

        const scale = parseInt(scaleValue.value, 10) / 100;

        // Определяем выбранный эффект
        const selectedEffect = [...effectsRadios].find(r => r.checked)?.value || 'none';
        const effectIntensity = effectLevelValue?.value || null;

        const newPhoto = {
          id: Date.now(),
          url: localUrl,
          likes: 0,
          comments: [],
          description: descriptionInput.value,
          effect: selectedEffect,
          intensity: effectIntensity,
          scale: scale
        };

        // Генерируем глобальное событие
        document.dispatchEvent(
          new CustomEvent("photo:uploaded", { detail: newPhoto })
        );

        // Показываем модалку успеха
        const successNode = successTemplate ? successTemplate.cloneNode(true) : null;
        const modal = showModalMessage(successNode);
        setupModalCloseHandlers(modal, '.success__button');

        closeForm();
      })
      .catch((err) => {
        console.error(err);
        removeLoadingMessage(loadingNode);
        submitBtn.disabled = false;

        const errorNode = errorTemplate ? errorTemplate.cloneNode(true) : null;
        const modal = showModalMessage(errorNode);
        setupModalCloseHandlers(modal, '.error__button');
      });
  });

  // Обработчик переключения эффектов — скрываем/показываем контейнер и сбрасываем уровень эффекта
  effectsRadios.forEach((r) => {
    r.addEventListener('change', (evt) => {
      const value = evt.target.value;
      if (value === 'none') {
        effectLevelContainer.classList.add('hidden');
        removePreviewFilter();
      } else {
        effectLevelContainer.classList.remove('hidden');
      }
      if (effectLevelValue) {effectLevelValue.value = '';}
      // сбрасываем слайдер и применяем эффект (будет установлен на максимум в setEffect)
      setEffect(value);
    });
  });

  // --- Добавляем обработчики для кнопок масштаба ---
  function changeScale(delta) {
    // читаем текущее значение
    const cur = parseInt(scaleValue.value.replace('%', ''), 10) || DEFAULT_SCALE;
    const next = cur + delta;
    const clamped = Math.max(SCALE_MIN, Math.min(SCALE_MAX, next));
    setScale(clamped);
  }

  if (scaleSmallerBtn) {
    scaleSmallerBtn.addEventListener('click', () => {
      changeScale(-SCALE_STEP);
    });
  }

  if (scaleBiggerBtn) {
    scaleBiggerBtn.addEventListener('click', () => {
      changeScale(SCALE_STEP);
    });
  }

  // Инициализируем слайдер при загрузке скрипта
  initEffectSlider();

  // Ставим начальное состояние эффектов: по умолчанию 'none'
  setEffect(DEFAULT_EFFECT);

})();

