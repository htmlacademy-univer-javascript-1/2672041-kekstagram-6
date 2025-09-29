
const checkLength = (string, maxLength) => string.length <= maxLength;

const isPalindrome = (string) => {
  const normalizedString = string.replace(/\s/g, '').toLowerCase();
  const reversedString = normalizedString.split('').reverse().join('');
  return normalizedString === reversedString;
};

const extractNumber = (input) => {
  const string = String(input);
  const digits = string.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : NaN;
};
