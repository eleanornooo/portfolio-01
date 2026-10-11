// Main navigation, shared by the header, the mobile menu and the footer.
export const NAV = [
  { to: '/research', key: 'research' },
  { to: '/publications', key: 'publications' },
  { to: '/talks', key: 'talks' },
  { to: '/teaching', key: 'teaching' },
  { to: '/about', key: 'about' },
  { to: '/contact', key: 'contact' },
] as const;

/** Pages that open on a full-bleed dark hero: the header floats over it, transparent and dark. */
export const DARK_HERO_ROUTES = ['/', '/research', '/about', '/teaching', '/publications', '/talks', '/contact'];
