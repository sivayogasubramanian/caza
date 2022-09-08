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
