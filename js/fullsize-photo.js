import { isEscapeKey } from './util.js';

const COMMENTS_SHOW_COUNT = 5;
const commentTemplate = document.querySelector('#comment').content;
const newTemplate = commentTemplate.querySelector('.social__comment');
const containerComments = document.querySelector('.social__comments');
const bigPicture = document.querySelector('.big-picture');
const bigImage = bigPicture.querySelector('img');
const closeBigPicture = document.querySelector('.big-picture__cancel');
const listComments = document.querySelector('.social__comment-count');
const allCommentsCount = document.querySelector('.comments-count');
const loadedComments = document.querySelector('.load__comments-count');
const commentsLoad = document.querySelector('.comments-loader');
const bodyTag = document.querySelector('body');

const onBigPhotoEscKeydown = (evt) => {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    onCloseBigPictureClick();
  }
};

function onCloseBigPictureClick() {
  containerComments.innerHTML = '';
  bigPicture.classList.add('hidden');
  listComments.classList.add('hidden');
  commentsLoad.classList.add('hidden');
  bodyTag.classList.remove('modal-open');
  containerComments.innerHTML = '';
  closeBigPicture.removeEventListener('click', onCloseBigPictureClick);
  document.removeEventListener('keydown', onBigPhotoEscKeydown);
}

function openBigPhoto() {
  bigPicture.classList.remove('hidden');
  listComments.classList.remove('hidden');
  commentsLoad.classList.remove('hidden');
  bodyTag.classList.add('modal-open');
  closeBigPicture.addEventListener('click', onCloseBigPictureClick);
  document.addEventListener('keydown', onBigPhotoEscKeydown);
}

const renderBigPhoto = (dataPhoto) => {
  const likesCount = document.querySelector('.likes-count');
  const descriptionPhoto = document.querySelector('.social__caption');
  bigImage.src = dataPhoto.url;
  likesCount.textContent = dataPhoto.likes;
  descriptionPhoto.textContent = dataPhoto.description;
  const { comments } = dataPhoto;
  allCommentsCount.textContent = comments.length;
  let commentsRendered = 0;

  const renderComments = (commentsData) => {
    const fragment = document.createDocumentFragment();
    commentsData.forEach((comment) => {
      const newComment = newTemplate.cloneNode(true);
      const socilComment = newComment.querySelector('.social__picture');
      newComment.querySelector('.social__text').textContent = comment.message;
      socilComment.src = comment.avatar;
      socilComment.alt = comment.name;
      fragment.append(newComment);
      commentsRendered += 1;
      loadedComments.textContent = commentsRendered;
      if (commentsRendered === comments.length) {
        commentsLoad.classList.add('hidden');
      }
    });
    containerComments.append(fragment);
  };
  const onCommentsLoadClick = () => {
    const commentsRender = comments.slice(commentsRendered, commentsRendered + COMMENTS_SHOW_COUNT);
    renderComments(commentsRender);
  };
  onCommentsLoadClick();
  commentsLoad.addEventListener('click', onCommentsLoadClick);
  closeBigPicture.addEventListener('click', () => commentsLoad.removeEventListener('click', onCommentsLoadClick));
};

export { renderBigPhoto, openBigPhoto, bodyTag };
