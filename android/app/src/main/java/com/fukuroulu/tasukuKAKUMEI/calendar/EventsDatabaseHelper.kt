package com.fukuroulu.tasukuKAKUMEI.calendar

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

private const val DATABASE_NAME = "events.db"

// マイグレーションを追加する配列。旧バージョンから順に処理を記述します
private val MIGRATIONS: Array<(SQLiteDatabase) -> Unit> = arrayOf(
    // 1 -> 2 のマイグレーション例
    { db ->
        // 例: カラム追加やテーブル変更など
        // db.execSQL("ALTER TABLE events ADD COLUMN example TEXT")
    }
)

// バージョンはマイグレーション数 + 1 で自動的に更新されるようにする
private val DATABASE_VERSION = MIGRATIONS.size + 1

class EventsDatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            "CREATE TABLE IF NOT EXISTS events (" +
                    "id TEXT PRIMARY KEY NOT NULL, " +
                    "json TEXT NOT NULL" +
            ")"
        )

        // 新規インストール時も最新スキーマとなるようマイグレーションを適用
        for (migration in MIGRATIONS) {
            migration(db)
        }
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // バージョンを順番に上げながらマイグレーションを実行
        for (version in oldVersion until newVersion) {
            MIGRATIONS.getOrNull(version - 1)?.invoke(db)
        }
    }
}
