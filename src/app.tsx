import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useAtomValue } from 'jotai';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemo } from 'react';
import { SettingsPage } from './pages/settings/page';
import { openSearchAtom } from './pages/search/jotai';
import { colorSchemeAtom, openSettingsAtom } from './pages/settings/jotai';
import { SearchPage } from './pages/search/page';
import { openQueryAtom } from './pages/detail/jotai';
import { DetailPage } from './pages/detail/page';
import { TrackPage } from './pages/track/page';
import { TransitionPage } from './components/index';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const App = () => {
  const openSearch = useAtomValue(openSearchAtom);
  const openSettings = useAtomValue(openSettingsAtom);
  const openDetail = useAtomValue(openQueryAtom);
  const colorScheme = useAtomValue(colorSchemeAtom);

  const colorScheme_ = useMemo(() => {
    if (colorScheme === 'auto') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    return colorScheme;
  }, [colorScheme]);

  return (
    <MantineProvider
      withNormalizeCSS
      withGlobalStyles
      theme={{
        colorScheme: colorScheme_,
        globalStyles: (theme) => ({
          'body': {
            width: 390,
            height: 564,
            overflow: 'hidden',
          },
          '#root': {
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
          },
          '.lucide': {
            width: '1em',
            height: '1em',
          },
        }),
        components: {
          Tooltip: {
            defaultProps: {
              withArrow: true,
            },
          },
        },
      }}
    >
      <Notifications position='bottom-center' limit={2} />
      <TransitionPage
        mounted={[openSearch, openSettings, openDetail].every(
          (open) => open === false,
        )}
      >
        <TrackPage />
      </TransitionPage>
      <TransitionPage mounted={openSearch}>
        <SearchPage />
      </TransitionPage>
      <TransitionPage mounted={openSettings}>
        <SettingsPage />
      </TransitionPage>
      <TransitionPage mounted={openDetail}>
        <DetailPage />
      </TransitionPage>
    </MantineProvider>
  );
};
