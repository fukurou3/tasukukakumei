package com.fukuroulu.tasukuKAKUMEI.calendar

import com.facebook.react.bridge.*
import org.json.JSONObject

class EventsDatabaseModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val helper = EventsDatabaseHelper(reactContext)

    override fun getName(): String = "EventsDatabase"

    @ReactMethod
    fun initialize(promise: Promise) {
        helper.writableDatabase
        promise.resolve(null)
    }

    @ReactMethod
    fun saveEvent(event: ReadableMap, promise: Promise) {
        val db = helper.writableDatabase
        val json = JSONObject(event.toHashMap()).toString()
        val id = event.getString("id") ?: run {
            promise.reject("no_id", "Event id is required")
            return
        }
        val stmt = db.compileStatement("INSERT OR REPLACE INTO events (id, json) VALUES (?, ?)")
        stmt.bindString(1, id)
        stmt.bindString(2, json)
        stmt.execute()
        promise.resolve(null)
    }

    @ReactMethod
    fun getAllEvents(promise: Promise) {
        val db = helper.readableDatabase
        val cursor = db.rawQuery("SELECT json FROM events", null)
        val array = Arguments.createArray()
        while (cursor.moveToNext()) {
            array.pushString(cursor.getString(0))
        }
        cursor.close()
        promise.resolve(array)
    }

    @ReactMethod
    fun deleteEvent(id: String, promise: Promise) {
        val db = helper.writableDatabase
        db.delete("events", "id=?", arrayOf(id))
        promise.resolve(null)
    }

    @ReactMethod
    fun clearEvents(promise: Promise) {
        val db = helper.writableDatabase
        db.delete("events", null, null)
        promise.resolve(null)
    }
}
