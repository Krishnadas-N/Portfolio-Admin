// regex-patterns.ts
export const REGEX_PATTERNS = {
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]+$/,
  ALPHABETS: /^[a-zA-Z]+$/,
  ALPHABETS_WITH_SPACES: /^[a-zA-Z\s]+$/,
  NUMBERS: /^\d+$/,
  DECIMALS: /^\d+(\.\d+)?$/,
  NO_SPACES: /^\S+$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  URL: /^(https?:\/\/)?([\w-]+)\.([a-zA-Z]{2,})([\w\-.~:/?#[\]@!$&'()*+,;%=]*)?$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  HEX_COLOR: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
  IMAGE_FORMAT: /\.(jpeg|jpg|png|gif|bmp|webp|svg|tiff)$/i,
  PASSWORD_STRONG:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  DATE_YYYY_MM_DD: /^\d{4}-\d{2}-\d{2}$/,
  TIME_HH_MM: /^([01]\d|2[0-3]):([0-5]\d)$/,
  HTML_TAG: /^<\/?[a-zA-Z][a-zA-Z0-9]*[^<>]*>$/,
  CSS_PROPERTY: /^[a-zA-Z-]+$/,
};
