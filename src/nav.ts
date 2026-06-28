// Shared client-side navigation helper for the custom pathname router.
export function go(path: string) {
  window.history.pushState({}, '', path);
  window.scrollTo(0, 0);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
