package com.fukuroulu.tasukuKAKUMEI.db

import com.facebook.react.bridge.*
import org.json.JSONObject

class TasksDatabaseModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val helper = TasksDatabaseHelper(reactContext)

    override fun getName(): String = "TasksDatabase"

    @ReactMethod
    fun initialize(promise: Promise) {
        helper.writableDatabase
        promise.resolve(null)
    }

    @ReactMethod
    fun saveTask(task: ReadableMap, promise: Promise) {
        val db = helper.writableDatabase
        val json = JSONObject(task.toHashMap()).toString()
        val id = task.getString("id") ?: run {
            promise.reject("no_id", "Task id is required")
            return
        }
        val stmt = db.compileStatement("INSERT OR REPLACE INTO tasks (id, json) VALUES (?, ?)")
        stmt.bindString(1, id)
        stmt.bindString(2, json)
        stmt.execute()
        promise.resolve(null)
    }

    @ReactMethod
    fun getAllTasks(promise: Promise) {
        val db = helper.readableDatabase
        val cursor = db.rawQuery("SELECT json FROM tasks", null)
        val array = Arguments.createArray()
        while (cursor.moveToNext()) {
            array.pushString(cursor.getString(0))
        }
        cursor.close()
        promise.resolve(array)
    }

    @ReactMethod
    fun deleteTask(id: String, promise: Promise) {
        val db = helper.writableDatabase
        db.delete("tasks", "id=?", arrayOf(id))
        promise.resolve(null)
    }
}
