// util.js

export const randomBetween = (a, b) => {
  const min = Math.ceil(Math.min(a, b));
  const max = Math.floor(Math.max(a, b));
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const pickItem = (list) => {
  const idx = randomBetween(0, list.length - 1);
  return list[idx];
};

export const idFactory = (start = 1) => {
  let current = start;
  return () => current++;
};
