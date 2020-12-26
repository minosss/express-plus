export const delay = <T>(time: number, result: T) => {
	return new Promise<T>((resolve) => {
		setTimeout(() => {
			resolve(result);
		}, time);
	});
};
