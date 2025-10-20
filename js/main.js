// main.js

import { generatePhotos } from './data.js';

// Генерируем массив данных
const photosData = generatePhotos();

// Можно вывести в консоль для проверки
console.log('Сгенерированные данные:', photosData);

// Если нужно использовать данные в других частях приложения — экспортируем
export { photosData };
