export function removeProtocolAndWwwIfPresent(url: string) {
  const httpProtocolPrefix = 'http://';
  const httpsProtocolPrefix = 'https://';
  const wwwPrefix = 'www.';

  let trimmedUrl = url;

  if (trimmedUrl.startsWith(httpProtocolPrefix)) {
    trimmedUrl = trimmedUrl.slice(httpProtocolPrefix.length);
  }

  if (trimmedUrl.startsWith(httpsProtocolPrefix)) {
    trimmedUrl = trimmedUrl.slice(httpsProtocolPrefix.length);
  }

  if (trimmedUrl.startsWith(wwwPrefix)) {
    trimmedUrl = trimmedUrl.slice(wwwPrefix.length);
  }

  return trimmedUrl;
}

export function capitalizeEveryWord(phrase: string) {
  // Safely handles words with length 0 or 1 as well.
  return phrase
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function trim(value: string | string[]) {
  return value.toString().trim();
}
