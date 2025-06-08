package com.fukuroulu.tasukuKAKUMEI.calendar

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class GoogleSyncService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        return HeadlessJsTaskConfig(
            "GoogleCalendarSync",
            intent?.extras?.let { Arguments.fromBundle(it) } ?: Arguments.createMap(),
            0,
            true
        )
    }
}
