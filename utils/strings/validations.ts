export function isEmpty(value: string) {
  return !value.trim();
}

// Note: This denotes a url as valid even without a protocol or domain.
export function isValidUrl(value: string) {
  const patternWithProtocol = new RegExp(
    '^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,})+)/?(?:\\s|$)',
  );

  const patternWithoutProtocol = new RegExp('^([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,})+)/?(?:\\s|$)');

  return patternWithProtocol.test(value) || patternWithoutProtocol.test(value);
}
