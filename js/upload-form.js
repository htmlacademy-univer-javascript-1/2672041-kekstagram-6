// Работа с формой загрузки/редактирования изображения и валидация Pristine

(function () {
  const form = document.querySelector('.img-upload__form');
  const fileInput = form.querySelector('.img-upload__input');
  const overlay = form.querySelector('.img-upload__overlay');
  const body = document.body;
  const cancelBtn = form.querySelector('.img-upload__cancel');
  const scaleValue = form.querySelector('.scale__control--value');
  const previewImage = form.querySelector('.img-upload__preview img');
  const effectsRadios = form.querySelectorAll('.effects__radio');
  const effectLevelContainer = form.querySelector('.img-upload__effect-level');
  const effectLevelValue = form.querySelector('.effect-level__value');
  const hashtagsInput = form.querySelector('.text__hashtags');
  const descriptionInput = form.querySelector('.text__description');
  const submitBtn = form.querySelector('.img-upload__submit');

  const DEFAULT_SCALE = 100;
  const DEFAULT_EFFECT = 'none';

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
      scaleValue.value = `${percent}%`;
      previewImage.style.transform = `scale(${percent / 100})`;
    }
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
  }

  function removePreviewFilter() {
    if (previewImage) {
      previewImage.style.filter = '';
      previewImage.style.webkitFilter = '';
    }
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

  // Закрываем и сбрасываем
  function closeForm() {
    form.reset();
    fileInput.value = '';
    setScale(DEFAULT_SCALE);
    setEffect(DEFAULT_EFFECT);
    removePreviewFilter();
    overlay.classList.add('hidden');
    body.classList.remove('modal-open');
    if (pristine) {
      pristine.reset();
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

  if (pristine) {
    pristine.addValidator(hashtagsInput, validateHashtags, hashtagsErrorMessage);
    pristine.addValidator(descriptionInput, validateDescription, 'Длина комментария не может превышать 140 символов.');
  }

  // Обработчики событий

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      openForm();
    }
  });

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

  form.addEventListener('reset', () => {
    setTimeout(() => {
      fileInput.value = '';
      setScale(DEFAULT_SCALE);
      setEffect(DEFAULT_EFFECT);
      removePreviewFilter();
      overlay.classList.add('hidden');
      body.classList.remove('modal-open');

      if (pristine) {
        pristine.reset();
      }
    }, 0);
  });

  form.addEventListener('submit', (evt) => {
    if (pristine) {
      const valid = pristine.validate();
      if (!valid) {
        evt.preventDefault();
        const firstError = form.querySelector('.form-error-text');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    submitBtn.disabled = true;
  });

  effectsRadios.forEach((r) => {
    r.addEventListener('change', (evt) => {
      if (evt.target.value === 'none') {
        effectLevelContainer.classList.add('hidden');
        removePreviewFilter();
      } else {
        effectLevelContainer.classList.remove('hidden');
      }
      if (effectLevelValue) {effectLevelValue.value = '';}
    });
  });

})();
