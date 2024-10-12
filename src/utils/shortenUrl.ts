export const shortenUrl = (url: string) => {
  // Extract the domain from the URL (this includes the subdomain and main domain)
  const domain = new URL(url).hostname;

  // Split the domain into subdomain and the main domain (e.g., 'bb975bdf69b1675b6c468df0dbe188d2.serveo.net')
  const domainParts = domain.split('.');

  // If there is no subdomain, return the original domain
  if (domainParts.length < 3) {
    return url; // No need to shorten
  }

  // Extract the subdomain (the part before the main domain)
  const subdomain = domainParts.slice(0, -2).join('.'); // Join in case the subdomain contains dots

  // Get the first 2 and last 2 characters of the subdomain
  const shortenedSubdomain = `${subdomain.substring(0, 1)}...${subdomain.slice(-2)}`;

  // Reconstruct the full domain using the shortened subdomain
  const shortenedDomain = `${shortenedSubdomain}.${domainParts.slice(-2).join('.')}`;

  // Return the full URL with the shortened domain
  return url.replace(domain, shortenedDomain);
};
