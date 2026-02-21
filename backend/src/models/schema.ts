import { pgTable, uuid, varchar, integer, timestamp, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  address: varchar('address', { length: 42 }).unique().notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('producer'),
  cooperativeId: uuid('cooperative_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cooperatives = pgTable('cooperatives', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  municipality: varchar('municipality', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  memberCount: integer('member_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const batches = pgTable('batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tokenId: integer('token_id').unique(),
  producerId: uuid('producer_id').notNull().references(() => users.id),
  residueType: varchar('residue_type', { length: 20 }).notNull(),
  weight: decimal('weight', { precision: 12, scale: 2 }).notNull(),
  variety: varchar('variety', { length: 50 }).notNull(),
  quality: varchar('quality', { length: 30 }).notNull(),
  ipfsHash: varchar('ipfs_hash', { length: 100 }),
  latitude: decimal('latitude', { precision: 10, scale: 6 }),
  longitude: decimal('longitude', { precision: 10, scale: 6 }),
  currentCustodian: varchar('current_custodian', { length: 42 }),
  isListed: boolean('is_listed').default(false),
  txHash: varchar('tx_hash', { length: 66 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: integer('listing_id').unique(),
  batchId: uuid('batch_id').notNull().references(() => batches.id),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  pricePerKg: decimal('price_per_kg', { precision: 20, scale: 8 }).notNull(),
  availableWeight: decimal('available_weight', { precision: 12, scale: 2 }),
  paymentToken: varchar('payment_token', { length: 42 }),
  active: boolean('active').default(true),
  txHash: varchar('tx_hash', { length: 66 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: integer('transaction_id').unique(),
  listingId: uuid('listing_id').notNull().references(() => listings.id),
  buyerId: uuid('buyer_id').notNull().references(() => users.id),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  weight: decimal('weight', { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 20, scale: 8 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  deliveryProof: varchar('delivery_proof', { length: 100 }),
  txHash: varchar('tx_hash', { length: 66 }),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const custodyRecords = pgTable('custody_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  batchId: uuid('batch_id').notNull().references(() => batches.id),
  fromAddress: varchar('from_address', { length: 42 }),
  toAddress: varchar('to_address', { length: 42 }).notNull(),
  location: varchar('location', { length: 255 }),
  txHash: varchar('tx_hash', { length: 66 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const carbonCredits = pgTable('carbon_credits', {
  id: uuid('id').primaryKey().defaultRandom(),
  creditId: integer('credit_id').unique(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  weight: decimal('weight', { precision: 12, scale: 2 }).notNull(),
  co2Equivalent: decimal('co2_equivalent', { precision: 12, scale: 2 }),
  claimed: boolean('claimed').default(false),
  txHash: varchar('tx_hash', { length: 66 }),
  mintedAt: timestamp('minted_at').defaultNow(),
});

export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  producerId: uuid('producer_id').notNull().references(() => users.id),
  dataSharingAllowed: boolean('data_sharing_allowed').default(false),
  aggregatedDataAllowed: boolean('aggregated_data_allowed').default(false),
  purpose: varchar('purpose', { length: 100 }),
  txHash: varchar('tx_hash', { length: 66 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userScores = pgTable('user_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  totalBatches: integer('total_batches').default(0),
  totalWeight: decimal('total_weight', { precision: 12, scale: 2 }).default('0'),
  successfulTransactions: integer('successful_transactions').default(0),
  carbonCreditsEarned: integer('carbon_credits_earned').default(0),
  qualityScore: integer('quality_score').default(0),
  greenScore: integer('green_score').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  key: varchar('key', { length: 64 }).unique().notNull(),
  name: varchar('name', { length: 100 }),
  permissions: jsonb('permissions'),
  lastUsed: timestamp('last_used'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
