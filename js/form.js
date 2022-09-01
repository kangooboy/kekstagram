import { bodyTag } from './fullsize-photo.js';
import { isEscapeKey } from './util.js';

const POST_URL = 'https://25.javascript.pages.academy/kekstagram';
const MAX_LENGTH_HASHTAGS_SYMBOLS = 20;
const MAX_LENGTH_DESCRIPTION_SYMBOLS = 140;
const MIN_LENGTH_HASHTAGS_SYMBOLS = 2;
const HASGTAGS_COUNTS = 5;
const FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];
const STEP_SCALE_PREVIEW = 25;
const MAX_ZOOM_PREVIEW_VALUE = 100;
const form = document.querySelector('.img-upload__form');
const submitButton = form.querySelector('.img-upload__submit');
const openForm = document.querySelector('.img-upload__input');
const description = document.querySelector('.text__description');
const editPhoto = document.querySelector('.img-upload__overlay');
const preview = document.querySelector('.img-upload__preview img');
const hashtag = document.querySelector('.text__hashtags');
const re = /^#[A-Za-zA-Яа-яËё0-9]{1,19}$/;

const onCloseSuccessErrorPopupClick = (evt) => {
  const successErrorPopup = bodyTag.lastElementChild.querySelector('div');
  const closeSuccessErrorPopup = bodyTag.lastElementChild.querySelector('button');
  if(!successErrorPopup.contains(evt.target) || closeSuccessErrorPopup.contains(evt.target)) {
    removePopup();
  }
};

function removePopup() {
  bodyTag.lastElementChild.remove();
  document.removeEventListener('click', onCloseSuccessErrorPopupClick);
  document.removeEventListener('keydown', onSuccessErrorEscKeydown);
}

function onSuccessErrorEscKeydown(evt) {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    removePopup();
  }
}

function onSuccessPopup() {
  onCloseFormClick();
  const successPopupTemplate = document.querySelector('#success').content.cloneNode(true);
  bodyTag.append(successPopupTemplate);
  document.addEventListener('click', onCloseSuccessErrorPopupClick);
  document.addEventListener('keydown', onSuccessErrorEscKeydown);
}

function onErrorPopup() {
  onCloseFormClick();
  const errorPopup = document.querySelector('#error').content.cloneNode(true);
  bodyTag.append(errorPopup);
  document.addEventListener('click', onCloseSuccessErrorPopupClick);
  document.addEventListener('keydown', onSuccessErrorEscKeydown);
}

//validate form

const checkLength = (value, maxLength) => value.length <= maxLength;

const getTags = (string) => string.split(' ').filter((item) => item !== '');

const checkMinlength = (string) => getTags(string).every((item) => item.length >= MIN_LENGTH_HASHTAGS_SYMBOLS);

const checkHashtagMaxlength = (string) => getTags(string).every((item) => checkLength(item, MAX_LENGTH_HASHTAGS_SYMBOLS));

const checkDescriptionMaxlength = (string) => string.length <= MAX_LENGTH_DESCRIPTION_SYMBOLS;

const checkHashtag = (string) => getTags(string).every((item) => item[0] === '#');

const checkSymbols = (string) => getTags(string).every((item) => item.length <= 1 || re.test(item));

const checkUniq = (string) => {
  const hashtags = getTags(string.toLowerCase());
  return hashtags.length === new Set(hashtags).size;
};

const checkCount = (string) => {
  const hashtags = getTags(string);
  return hashtags.length <= HASGTAGS_COUNTS || !hashtags.length > HASGTAGS_COUNTS;
};

const validateForm = () => {
  const pristine = new Pristine(form, {
    classTo: 'img-upload__form',
    errorTextParent: 'text__hashtags-container'
  });

  pristine.addValidator(hashtag, checkCount, `max ${HASGTAGS_COUNTS} hashtags`);
  pristine.addValidator(hashtag, checkHashtag, 'begin with #');
  pristine.addValidator(hashtag, checkMinlength, `hashtag min length ${MIN_LENGTH_HASHTAGS_SYMBOLS} symbols`);
  pristine.addValidator(hashtag, checkHashtagMaxlength, `hashtag max length ${MAX_LENGTH_HASHTAGS_SYMBOLS} symbols`);
  pristine.addValidator(hashtag, checkSymbols, 'wrong symbol');
  pristine.addValidator(hashtag, checkUniq, 'this hashtag already exist');
  pristine.addValidator(description, checkDescriptionMaxlength, `comments length max ${MAX_LENGTH_DESCRIPTION_SYMBOLS} symbols`);

  // end validate form

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const validHashtag = pristine.validate();
    if (validHashtag) {
      const formData = new FormData(evt.target);
      submitButton.disabled = true;
      fetch(
        POST_URL,
        {
          method: 'POST',
          body: formData,
        },
      )
        .then((responce) => {
          if (!responce.ok) {
            throw new Error;
          }
          onSuccessPopup();
          submitButton.disabled = false;
        })
        .catch(() => {
          onErrorPopup();
          submitButton.disabled = false;
        });
    }
  });
};

// scale preview image

const buttonDecreasePreview = document.querySelector('.scale__control--smaller');
const buttonIncreasePreview = document.querySelector('.scale__control--bigger');
const imageScaleValue = document.querySelector('.scale__control--value');

function onButtonDecreasePreviewClick() {
  imageScaleValue.value = `${parseFloat(imageScaleValue.value) - STEP_SCALE_PREVIEW}%`;
  preview.style.transform = `scale(${imageScaleValue.value})`;
  buttonIncreasePreview.addEventListener('click', onButtonIncreasePreviewClick);
  if (imageScaleValue.value === `${STEP_SCALE_PREVIEW}%`) {
    buttonDecreasePreview.removeEventListener('click', onButtonDecreasePreviewClick);
  }
}

function onButtonIncreasePreviewClick() {
  imageScaleValue.value = `${parseFloat(imageScaleValue.value) + STEP_SCALE_PREVIEW}%`;
  preview.style.transform = `scale(${imageScaleValue.value}`;
  buttonDecreasePreview.addEventListener('click', onButtonDecreasePreviewClick);
  if (imageScaleValue.value === `${MAX_ZOOM_PREVIEW_VALUE}%`) {
    buttonIncreasePreview.removeEventListener('click', onButtonIncreasePreviewClick);
  }
}

// slider

const sliderElement = document.querySelector('.img-upload__effect-level');
const slider = document.querySelector('.effect-level__slider');
const effect = document.querySelector('.effect-level__value');
const effectsList = document.querySelector('.effects__list');

noUiSlider.create(slider, {
  range: {
    min: 0,
    max: 100,
  },
  start: 100,
  step: 1,
  connect: 'lower',
});

let filter;
let units;
slider.noUiSlider.on('update', () => {
  effect.value = slider.noUiSlider.get();
  preview.style.filter = `${filter}(${effect.value}${units})`;
});

const filterSettings = {
  chrome: {
    config: {
      range: {
        min: 0,
        max: 1,
      },
      start: 1,
      step: 0.1,
    },
    filter: 'grayscale',
    units: ''
  },
  sepia: {
    config: {
      range: {
        min: 0,
        max: 1,
      },
      start: 1,
      step: 0.1,
    },
    filter: 'sepia',
    units: ''
  },
  marvin: {
    config: {
      range: {
        min: 0,
        max: 100,
      },
      start: 100,
      step: 1,
    },
    filter: 'invert',
    units: '%'
  },
  phobos: {
    config: {
      range: {
        min: 0,
        max: 3,
      },
      start: 3,
      step: 0.1,
    },
    filter: 'blur',
    units: 'px'
  },
  heat: {
    config: {
      range: {
        min: 1,
        max: 3,
      },
      start: 3,
      step: 0.1,
    },
    filter: 'brightness',
    units: ''
  }
};

const resetEffects = (evt) => {
  preview.removeAttribute('class');
  preview.classList.add(`effects__preview--${evt.target.value}`);
  preview.style.filter = '';
};

const onEffectsListChange = (evt) => {
  if (evt.target.value === 'none') {
    sliderElement.classList.add('hidden');
    resetEffects(evt);
    return;
  }
  sliderElement.classList.remove('hidden');
  resetEffects(evt);
  const config = evt.target.value;
  const filterConfig = filterSettings[config];
  filter = filterConfig.filter;
  units = filterConfig.units;
  slider.noUiSlider.updateOptions(filterConfig.config);

};

// end slider

function onUploadEscKeydown(evt) {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    onCloseFormClick();
  }
}

const removeEscKeydownInFocusInput = () => {
  description.addEventListener('focus', () => {
    document.removeEventListener('keydown', onUploadEscKeydown);
    description.addEventListener('blur', () => {
      document.addEventListener('keydown', onUploadEscKeydown);
    });
  });
  hashtag.addEventListener('focus', () => {
    document.removeEventListener('keydown', onUploadEscKeydown);
    hashtag.addEventListener('blur', () => {
      document.addEventListener('keydown', onUploadEscKeydown);
    });
  });
};


openForm.addEventListener('change', () => {
  const file = openForm.files[0];
  const fileName = file.name.toLowerCase();
  const matches = FILE_TYPES.some((it) => fileName.endsWith(it));
  if (matches) {
    preview.src = URL.createObjectURL(file);
  }
});

function onOpenFormChange() {
  sliderElement.classList.add('hidden');
  editPhoto.classList.remove('hidden');
  bodyTag.classList.add('modal-open');
  removeEscKeydownInFocusInput();
  buttonDecreasePreview.addEventListener('click', onButtonDecreasePreviewClick);
  effectsList.addEventListener('change', onEffectsListChange);
  document.addEventListener('keydown', onUploadEscKeydown);
}

function onCloseFormClick() {
  preview.src = 'img/upload-default-image.jpg';
  editPhoto.classList.add('hidden');
  bodyTag.classList.remove('modal-open');
  openForm.value = '';
  hashtag.value = '';
  description.value = '';
  slider.noUiSlider.reset();
  preview.removeAttribute('style');
  preview.removeAttribute('class');
  document.querySelector('#effect-none').checked = true;
  imageScaleValue.value = '100%';
  description.addEventListener('input', () => {
    document.removeEventListener('keydown', onUploadEscKeydown);
  });
  hashtag.addEventListener('input', () => {
    document.removeEventListener('keydown', onUploadEscKeydown);
  });
  effectsList.removeEventListener('change', onEffectsListChange);
  buttonDecreasePreview.removeEventListener('click', onButtonDecreasePreviewClick);
  buttonIncreasePreview.removeEventListener('click', onButtonIncreasePreviewClick);
  document.removeEventListener('keydown', onUploadEscKeydown);
}

const initializeForm = () => {
  const closeForm = document.querySelector('#upload-cancel');
  openForm.addEventListener('change', onOpenFormChange);
  closeForm.addEventListener('click', onCloseFormClick);
  validateForm();
};

export { initializeForm, onCloseFormClick, onCloseSuccessErrorPopupClick, onSuccessErrorEscKeydown };
