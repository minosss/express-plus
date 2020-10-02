import Dexie from 'dexie';

const db = new Dexie('ExpressPlus');
db.version(1).stores({
	favorites: 'postId,type,phone,state,pin,*tags,createdAt,updatedAt,message',
	histories: 'postId,type,phone,updatedAt',
	settings: 'key,value',
});

// db.version(2)

export default db;
