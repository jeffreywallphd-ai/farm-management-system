type AppRouter = {
  push: (href: never) => void;
  replace: (href: never) => void;
};

export function pushRoute(router: AppRouter, href: string): void {
  router.push(href as never);
}

export function replaceRoute(router: AppRouter, href: string): void {
  router.replace(href as never);
}
