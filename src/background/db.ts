import {createRxDatabase} from 'rxdb';
import {getRxStorageDexie} from 'rxdb/plugins/storage-dexie';

export async function createDb() {
	const db = await createRxDatabase({
		name: 'expressdb',
		storage: getRxStorageDexie(),
	});

	await db.addCollections({
		track: {
			schema: {
				title: 'track',
				primaryKey: 'id',
				properties: {
					id: {
						type: 'string',
						maxLength: 100,
					},
					kind: {
						type: 'string',
					},
					phone: {
						type: 'string',
					},
					tags: {
						type: 'array',
					},
					updatedAt: {
						type: ['string', 'number'],
					},
					createdAt: {
						type: ['string', 'number'],
					},
				},
				type: 'object',
				version: 0,
				required: ['id', 'kind'],
				indexes: ['updatedAt'],
			},
		},
		settings: {
			schema: {
				title: 'settings',
				primaryKey: 'key',
				properties: {
					key: {
						type: 'key',
						maxLength: 100,
					},
					value: {
						type: ['boolean', 'string', 'number', 'null'],
					},
				},
				type: 'object',
				version: 0,
				required: ['key', 'value'],
			},
		},
	});

	return db;
}

type Database = Awaited<ReturnType<typeof createDb>>;

let db: Database | null = null;

function initGlobalDb() {
	if (db != null) return;

	createDb()
		.then((db_) => {
			db = db_;
		})
		.catch((error) => {
			console.error('Initial database fail');
			console.error(error);
		});
}

initGlobalDb();

export function getDb() {
	if (db == null) throw new Error('Database is null');
	return db;
}
