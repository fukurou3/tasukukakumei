package com.fukuroulu.app.db

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

private const val DATABASE_NAME = "tasks.db"
private const val DATABASE_VERSION = 1

class TasksDatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            "CREATE TABLE IF NOT EXISTS tasks (" +
                "id TEXT PRIMARY KEY NOT NULL, " +
                "json TEXT NOT NULL" +
            ")"
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // バージョンアップ時のマイグレーション処理をここに追加します
    }
}
