import {MantineProvider} from '@mantine/core';
import {NotificationsProvider} from '@mantine/notifications';
import {useAtomValue} from 'jotai';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {SettingsPage} from './pages/settings/page';
import {openSearchAtom} from './pages/search/jotai';
import {openSettingsAtom} from './pages/settings/jotai';
import {SearchPage} from './pages/search/page';
import {openQueryAtom} from './pages/detail/jotai';
import {DetailPage} from './pages/detail/page';
import {TrackPage} from './pages/track/page';
import {TransitionPage} from './components/index';
import 'dayjs/locale/zh-cn';

// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(relativeTime);
// eslint-disable-next-line import/no-named-as-default-member
dayjs.locale('zh-cn');

export const App = () => {
	const openSearch = useAtomValue(openSearchAtom);
	const openSettings = useAtomValue(openSettingsAtom);
	const openDetail = useAtomValue(openQueryAtom);

	return (
		<MantineProvider
			withNormalizeCSS
			withGlobalStyles
			theme={{
				globalStyles: (theme) => ({
					body: {
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
			<NotificationsProvider position='bottom-center' limit={2}>
				<TransitionPage
					mounted={[openSearch, openSettings, openDetail].every(
						(open) => open === false
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
			</NotificationsProvider>
		</MantineProvider>
	);
};
