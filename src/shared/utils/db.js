import Dexie from 'dexie';

const db = new Dexie('ExpressPlus');
db.version(3)
	.stores({
		favorites: 'postId,type,phone,state,pin,*tags,createdAt,updatedAt,message',
		histories: 'postId,type,updatedAt',
		settings: 'key,value',
	})
	.upgrade((trans) => {
		console.log('up');
	});

export default db;
