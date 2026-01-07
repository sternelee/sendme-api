import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { v7 as uuidv7 } from 'uuid'
import { user } from './auth'

export const file = sqliteTable('file', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  originalName: text('original_name').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileType: text('file_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  url: text('url'),
  storageProvider: text('storage_provider').notNull(),
  uploadedBy: text('uploaded_by'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull()
})

export const fileRelations = relations(file, ({ one }) => ({
  uploadedByUser: one(user, {
    fields: [file.uploadedBy],
    references: [user.id]
  })
}))
