// main.js

import { generatePhotoSet } from './data.js';
import { renderThumbnails } from './thumbnails.js';

const allPhotos = generatePhotoSet();
renderThumbnails(allPhotos);
