// Shared client-side navigation helper for the custom pathname router.
export function go(path: string) {
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const needsFullRender = path === '/projects' || currentPath === '/projects';

  if (needsFullRender) {
    window.location.assign(path);
    return;
  }

  window.history.pushState({}, '', path);
  window.scrollTo(0, 0);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
