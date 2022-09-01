
import { renderBigPhoto, openBigPhoto } from './fullsize-photo.js';
import { onCloseFormClick, onCloseSuccessErrorPopupClick, onSuccessErrorEscKeydown } from './form.js';
import { bodyTag } from './fullsize-photo.js';
import  { debounce, shuffleArray } from './util.js';

const RERENDER_DELAY = 500;
const RANDOM_THUMBNAILS = 10;
const thumbnailContainer = document.querySelector('.pictures');
const thumbnailListFragment = document.createDocumentFragment();
const thumbnailTemplate = document.querySelector('#picture').content;
const newTemplate = thumbnailTemplate.querySelector('.picture');
const filterThumbnailsMenuContainer = document.querySelector('.img-filters');
const filterThumbnailsMenu = document.querySelector('.img-filters__form');
const filterButtonDefault = filterThumbnailsMenu.querySelector('#filter-default');
const filterRandomButton = filterThumbnailsMenu.querySelector('#filter-random');
const filterButtonDiscussed = filterThumbnailsMenu.querySelector('#filter-discussed');

const createThumbnail = (data) => {
  const newThumbnail = newTemplate.cloneNode(true);
  const imgUrl = newThumbnail.querySelector('.picture__img');
  const likesCount = newThumbnail.querySelector('.picture__likes');
  const pictureComments = newThumbnail.querySelector('.picture__comments');
  pictureComments.textContent = data.comments.length;
  imgUrl.src = data.url;
  likesCount.textContent = data.likes;

  newThumbnail.addEventListener('click', () => {
    openBigPhoto();
    renderBigPhoto(data);
  });
  return newThumbnail;
};

function onErrorLoad() {
  onCloseFormClick();
  const errorPopup = document.querySelector('#error').content.cloneNode(true);
  errorPopup.querySelector('.error__title').textContent = 'ошибка загрузки';
  errorPopup.querySelector('.error__button').textContent = 'закрыть';
  bodyTag.append(errorPopup);
  document.addEventListener('click', onCloseSuccessErrorPopupClick);
  document.addEventListener('keydown', onSuccessErrorEscKeydown);
}

const clearThumbnailsContainer = () => {
  const elements = thumbnailContainer.querySelectorAll('.picture');
  [...elements].forEach((item) => item.remove());
};

const renderThumbnails = (photosData) => {
  clearThumbnailsContainer();
  const thumbnails = photosData.map(createThumbnail);
  thumbnailListFragment.append(...thumbnails);
  thumbnailContainer.append(thumbnailListFragment);
};

const showFilteredThumbnails = (data) => {
  filterThumbnailsMenuContainer.classList.remove('img-filters--inactive');
  filterThumbnailsMenuContainer.addEventListener('click', debounce((evt) => {
    if (evt.target.classList.contains('img-filters__button--active')) {
      return;
    }
    filterButtonDefault.classList.remove('img-filters__button--active');
    filterRandomButton.classList.remove('img-filters__button--active');
    filterButtonDiscussed.classList.remove('img-filters__button--active');
    if (evt.target === filterButtonDefault) {
      filterButtonDefault.classList.add('img-filters__button--active');
      clearThumbnailsContainer();
      renderThumbnails(data);
    }
    if (evt.target === filterRandomButton) {
      filterRandomButton.classList.add('img-filters__button--active');
      const random = shuffleArray([...data]).slice(0, RANDOM_THUMBNAILS);
      clearThumbnailsContainer();
      renderThumbnails(random);
    }
    if (evt.target === filterButtonDiscussed) {
      filterButtonDiscussed.classList.add('img-filters__button--active');
      const discussedData = data.slice().sort((a, b) => b.comments.length - a.comments.length);
      clearThumbnailsContainer();
      renderThumbnails(discussedData);
    }
  }, RERENDER_DELAY));
};

export { renderThumbnails, onErrorLoad, showFilteredThumbnails };


