import Dexie from 'dexie';

const db = new Dexie('ExpressPlus');
db.version(1)
	.stores({
		favorites: 'postId,type,phone,pin,*tags,updatedAt,message',
		settings: 'key,value',
	})
	.upgrade((trans) => {
		console.log('up');
	});

export default db;
