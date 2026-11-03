// Cancha's public site addresses. Framer now reports wearecancha.framer.website as production (seen Nov 3);
// the original framer.app address still serves the same site. Add the custom domain here when it is connected.
export const SITE_HOSTS=['wearecancha.framer.website','pioneering-friday-005497.framer.app'];
export const isCanchaHost=host=>SITE_HOSTS.includes(String(host||'').toLowerCase());
