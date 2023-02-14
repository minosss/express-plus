//
export const wait = async <T>(result: T, time = 3000) => {
	return new Promise<T>((resolve) => {
		setTimeout(() => {
			resolve(result);
		}, time);
	});
};
