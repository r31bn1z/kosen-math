const CANONICAL_HOST = 'kosen-math.r31bn1z.com';
const PAGES_DEV_HOST = 'kosen-math.pages.dev';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === PAGES_DEV_HOST) {
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
