import { mapLegacyRoute } from './mapLegacyRoute';

export function useSiteStore() {
  const menuOpen = useState('menuOpen', () => false);
  const route = useRoute();
  const legacyRoute = computed(() => mapLegacyRoute(route));
  return reactive({
    get menuOpen() {
      return menuOpen.value;
    },
    set menuOpen(v) {
      menuOpen.value = v;
    },
    get route() {
      return legacyRoute.value;
    },
  });
}
