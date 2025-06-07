package com.fukuroulu.app.db

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

private const val DATABASE_NAME = "tasks.db"

// 各バージョンアップ用のマイグレーション関数を順番に追加していきます
private val MIGRATIONS: Array<(SQLiteDatabase) -> Unit> = arrayOf(
    // 1 -> 2 のマイグレーション例
    { db ->
        // 例: 新しいカラム追加など
        // db.execSQL("ALTER TABLE tasks ADD COLUMN example TEXT")
    }
)

// データベースバージョンはマイグレーション数 + 1 とすることで、
// 新しいマイグレーションを追加するだけで自動的にバージョンが上がります
private val DATABASE_VERSION = MIGRATIONS.size + 1

class TasksDatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            "CREATE TABLE IF NOT EXISTS tasks (" +
                "id TEXT PRIMARY KEY NOT NULL, " +
                "json TEXT NOT NULL" +
            ")"
        )

        // 新規作成時にも最新スキーマとなるようマイグレーションをすべて適用
        for (migration in MIGRATIONS) {
            migration(db)
        }
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // oldVersion から newVersion まで順番にマイグレーションを適用
        for (version in oldVersion until newVersion) {
            MIGRATIONS.getOrNull(version - 1)?.invoke(db)
        }
    }
}
