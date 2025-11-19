// data.js

import { randomBetween, pickItem, idFactory } from './util.js';

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

const messageFragments = [
  'Всё отлично!',
  'В целом неплохо, но можно лучше.',
  'Следовало бы убирать палец из кадра.',
  'Бабушка чихнула — и вышло лучше.',
  'Уронил камеру — и всё равно лучше.',
  'Лица перекошены, как будто дерутся.'
];

const authorNames = [
  'Артём', 'Мария', 'Иван', 'Ольга', 'Дмитрий',
  'Елена', 'Анна', 'Сергей', 'Татьяна', 'Алексей',
  'Наталья', 'Михаил', 'Светлана', 'Роман', 'Юлия'
];

const nextId = idFactory(1);

const createComment = () => {
  const pieces = randomBetween(1, 2);
  const block = Array.from({ length: pieces }, () => pickItem(messageFragments));
  return {
    id: nextId(),
    avatar: `img/avatar-${randomBetween(1, 6)}.svg`,
    message: block.join(' '),
    name: pickItem(authorNames)
  };
};

const createPhoto = (index) => {
  const commentCount = randomBetween(0, 30);
  const commentList = Array.from({ length: commentCount }, createComment);

  return {
    id: index,
    url: `photos/${index}.jpg`,
    description: pickItem(descriptions),
    likes: randomBetween(15, 200),
    comments: commentList
  };
};

export const generatePhotoSet = () => Array.from({ length: 25 }, (_, i) => createPhoto(i + 1));
