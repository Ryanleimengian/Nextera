/** 將 Nuxt route 對應至舊版 hash 路由的 { name, path, query, param } */
export function mapLegacyRoute(route) {
  const path = route.path.replace(/\/+$/, '') || '/';
  let name = 'notfound';
  let param = null;
  if (path === '/') name = 'home';
  else if (path === '/work') name = 'work';
  else if (path.startsWith('/work/')) {
    name = 'case';
    param = route.params.slug;
  } else if (path.startsWith('/services/')) {
    name = 'service';
    param = route.params.slug;
  } else if (path === '/about') name = 'about';
  else if (path === '/media') name = 'media';
  else if (path === '/contact') name = 'contact';
  else if (path === '/privacy') name = 'privacy';
  else if (path === '/terms') name = 'terms';
  return { name, path, query: route.query, param };
}
