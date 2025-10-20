// data.js

import { getRandomInteger, getRandomArrayElement, createIdGenerator } from './util.js';

const descriptions = [
  'Захватывающий вид на закат.',
  'Дружеская прогулка по парку.',
  'Уютный вечер с книгой.',
  'Вкуснейший ужин при свечах.',
  'Незабываемая поездка в горы.',
  'Свежий бриз на берегу моря.',
  'Прекрасный момент с семьёй.',
  'Работа мечты.',
  'Самый яркий момент недели.',
  'Тишина и покой в лесу.',
  'Новый день, новые впечатления.',
  'Вдохновляющий момент.',
  'Случайный кадр, который стал любимым.',
  'Природа в её первозданной красоте.',
  'Счастливый момент, остановленный во времени.',
  'Солнце играет на волнах.',
  'Танец ветра в листве.',
  'Сияние звёзд над городом.',
  'Тёплый свет уютного огня.',
  'Тишина утра в деревне.',
  'Смех детей на площадке.',
  'Кофе и тишина утром.',
  'Дождевые капли на стекле.',
  'Снег и спокойствие зимнего дня.',
  'Прогулка по осеннему лесу.'
];

const messages = [
  'Всё отлично!',
  'В целом всё неплохо. Но не всё.',
  'Когда вы делаете фотографию, хорошо бы убирать палец из кадра. В конце концов это просто непрофессионально.',
  'Моя бабушка случайно чихнула с фотоаппаратом в руках и у неё получилась фотография лучше.',
  'Я поскользнулся на банановой кожуре и уронил фотоаппарат на кота и у меня получилась фотография лучше.',
  'Лица у людей на фотке перекошены, как будто их избивают. Как можно было поймать такой неудачный момент?!'
];

const names = [
  'Артём',
  'Мария',
  'Иван',
  'Ольга',
  'Дмитрий',
  'Елена',
  'Анна',
  'Сергей',
  'Татьяна',
  'Алексей',
  'Наталья',
  'Михаил',
  'Светлана',
  'Роман',
  'Юлия'
];

const generateComment = (idGenerator) => {
  const numMessages = getRandomInteger(1, 2);
  const commentMessages = [];
  for (let i = 0; i < numMessages; i++) {
    commentMessages.push(getRandomArrayElement(messages));
  }

  return {
    id: idGenerator(),
    avatar: `img/avatar-${getRandomInteger(1, 6)}.svg`,
    message: commentMessages.join(' '),
    name: getRandomArrayElement(names)
  };
};

const generatePhoto = (index, idGenerator) => {
  const numComments = getRandomInteger(0, 30);
  const comments = [];
  for (let i = 0; i < numComments; i++) {
    comments.push(generateComment(idGenerator));
  }

  return {
    id: index,
    url: `photos/${index}.jpg`,
    description: getRandomArrayElement(descriptions),
    likes: getRandomInteger(15, 200),
    comments: comments
  };
};

export const generatePhotos = () => {
  const idGenerator = createIdGenerator(1);
  const photos = [];
  for (let i = 1; i <= 25; i++) {
    photos.push(generatePhoto(i, idGenerator));
  }
  return photos;
};
