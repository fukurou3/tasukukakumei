#import "EventsDatabaseModule.h"

@implementation EventsDatabaseModule
{
    sqlite3 *_db;
}

RCT_EXPORT_MODULE(EventsDatabase);

RCT_EXPORT_METHOD(initialize:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *docs = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)[0];
    NSString *path = [docs stringByAppendingPathComponent:@"events.db"];
    if (sqlite3_open([path UTF8String], &_db) == SQLITE_OK) {
        const char *sql = "CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL);";
        char *err;
        if (sqlite3_exec(_db, sql, NULL, NULL, &err) != SQLITE_OK) {
            reject(@"init_error", [NSString stringWithUTF8String:err], nil);
            sqlite3_close(_db);
            return;
        }
        resolve(nil);
    } else {
        reject(@"init_error", @"Failed to open DB", nil);
    }
}

RCT_EXPORT_METHOD(saveEvent:(NSDictionary *)event
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *eventId = event[@"id"];
    if (!eventId) {
        reject(@"no_id", @"Event id is required", nil);
        return;
    }
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:event options:0 error:&error];
    if (error) {
        reject(@"json_error", error.localizedDescription, nil);
        return;
    }
    NSString *json = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    const char *sql = "INSERT OR REPLACE INTO events (id, json) VALUES (?, ?);";
    sqlite3_stmt *stmt;
    if (sqlite3_prepare_v2(_db, sql, -1, &stmt, NULL) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, [eventId UTF8String], -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, [json UTF8String], -1, SQLITE_TRANSIENT);
        if (sqlite3_step(stmt) != SQLITE_DONE) {
            reject(@"db_error", @"Failed to save event", nil);
        } else {
            resolve(nil);
        }
        sqlite3_finalize(stmt);
    } else {
        reject(@"db_error", @"Failed to prepare statement", nil);
    }
}

RCT_EXPORT_METHOD(getAllEvents:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    const char *sql = "SELECT json FROM events;";
    sqlite3_stmt *stmt;
    NSMutableArray *result = [NSMutableArray array];
    if (sqlite3_prepare_v2(_db, sql, -1, &stmt, NULL) == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            const unsigned char *text = sqlite3_column_text(stmt, 0);
            if (text) {
                NSString *json = [NSString stringWithUTF8String:(const char *)text];
                [result addObject:json];
            }
        }
        sqlite3_finalize(stmt);
        resolve(result);
    } else {
        reject(@"db_error", @"Failed to query", nil);
    }
}

RCT_EXPORT_METHOD(deleteEvent:(NSString *)eventId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    const char *sql = "DELETE FROM events WHERE id = ?";
    sqlite3_stmt *stmt;
    if (sqlite3_prepare_v2(_db, sql, -1, &stmt, NULL) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, [eventId UTF8String], -1, SQLITE_TRANSIENT);
        if (sqlite3_step(stmt) != SQLITE_DONE) {
            reject(@"db_error", @"Failed to delete", nil);
        } else {
            resolve(nil);
        }
        sqlite3_finalize(stmt);
    } else {
        reject(@"db_error", @"Failed to prepare delete", nil);
    }
}

RCT_EXPORT_METHOD(clearEvents:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    const char *sql = "DELETE FROM events";
    char *err;
    if (sqlite3_exec(_db, sql, NULL, NULL, &err) == SQLITE_OK) {
        resolve(nil);
    } else {
        reject(@"db_error", @"Failed to clear", nil);
    }
}

@end
