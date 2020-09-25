export const delay = (time, result) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(result);
		}, time);
	});
};
