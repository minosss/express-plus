import type { Settings, TrackList } from '../types';
import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { QueryState } from '../api/types';

export async function createDb() {
  const db = await createRxDatabase({
    name: 'expressdb',
    storage: getRxStorageDexie(),
  });

  await db.addCollections({
    track: {
      autoMigrate: true,
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
          context: {
            type: 'string',
          },
          state: {
            type: 'string',
          },
          updatedAt: {
            type: ['string', 'number'],
          },
          createdAt: {
            type: ['string', 'number'],
          },
          tags: {
            type: 'array',
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

async function initGlobalDb() {
  return createDb().then((db_) => {
    db = db_;
  });
}

export async function getDb() {
  if (db == null) {
    await initGlobalDb();
  }
  if (db == null) {
    throw new Error('Database is null');
  }
  return db;
}

export const defaultSettings: Partial<Settings> = {
  autoInterval: 60,
  enableFilterDelivered: true,
};

// 不在查询的状态
const regex = !/^(3|301|302|303|304|14|401|4)$/;
export async function getUncheckList() {
  const db_ = await getDb();
  const list = await db_.track
    ?.find({
      selector: {
        state: {
          $regex: regex,
        },
      },
    })
    .exec();

  return (list ?? []).map((doc) => doc.toJSON()) as TrackList;
}

export async function getSettings() {
  const db_ = await getDb();
  const settings = await db_.settings?.find().exec();

  if (settings == null) return defaultSettings;

  const result: Record<string, any> = { ...defaultSettings };
  for (const { key, value } of settings) {
    if (typeof key === 'string' && result[key] != null) {
      result[key] = value;
    }
  }
  return result as Partial<Settings>;
}
