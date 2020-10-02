// 对后台的请求接口
export const API_URLS = {
	// 快递识别
	KUAIDI_AUTO: '/kuaidi/auto',
	// 快递查询
	KUAIDI_QUERY: '/kuaidi/query',
	// 获取收藏列表
	FAVORITES: '/favorites',
	// 获取单个收藏详情
	FAVORITES_GET: '/favorites/get',
	// 添加一个收藏
	FAVORITES_ADD: '/favorites/add',
	// 更新一个收藏
	FAVORITES_PATCH: '/favorites/patch',
	// 移除一个收藏
	FAVORITES_REMOVE: '/favorites/remove',
	// 获取历史记录
	HISTORIES: '/histories',
	HISTORIES_ADD: '/histories/add',
	HISTORIES_CLEAR: '/histories/clear',
	// 获取设置
	SETTINGS: '/settings',
	// 更新设置
	SETTINGS_PATCH: '/settings/patch',
	// cookies
	REFRESH_COOKIES: '/refresh/cookies',
};

// 设置键值
export const SETTING_KEYS = {
	// 是否开启自动查询
	ENABLE_AUTO: 'enableAuto',
	// 是否过滤已签收状态
	ENABLE_FILTER_DELIVERED: 'enableFilterDelivered',
	// 自动查询间隔
	AUTO_INTERVAL: 'autoInterval',
	// cookies
	COOKIES: 'cookieKuaidi100',
};

export const PATHNAMES = {
	FAVORITES: '/app/favorites',
	SETTINGS: '/app/settings',
	FAVORITE_DETAIL: '/app/detail',
	FAVORITE_EDIT_SELECT: '/app/select',
	HISTORIES: '/app/histories',
};
