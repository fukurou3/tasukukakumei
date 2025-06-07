#import "TasksDatabaseModule.h"

@implementation TasksDatabaseModule
{
    sqlite3 *_db;
}

RCT_EXPORT_MODULE(TasksDatabase);

RCT_EXPORT_METHOD(initialize:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *docs = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)[0];
    NSString *path = [docs stringByAppendingPathComponent:@"tasks.db"];
    if (sqlite3_open([path UTF8String], &_db) == SQLITE_OK) {
        const char *sql = "CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL);";
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

RCT_EXPORT_METHOD(saveTask:(NSDictionary *)task resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *taskId = task[@"id"];
    if (!taskId) {
        reject(@"no_id", @"Task id is required", nil);
        return;
    }
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:task options:0 error:&error];
    if (error) {
        reject(@"json_error", error.localizedDescription, nil);
        return;
    }
    NSString *json = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];

    const char *sql = "INSERT OR REPLACE INTO tasks (id, json) VALUES (?, ?);";
    sqlite3_stmt *stmt;
    if (sqlite3_prepare_v2(_db, sql, -1, &stmt, NULL) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, [taskId UTF8String], -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, [json UTF8String], -1, SQLITE_TRANSIENT);
        if (sqlite3_step(stmt) != SQLITE_DONE) {
            reject(@"db_error", @"Failed to save task", nil);
        } else {
            resolve(nil);
        }
        sqlite3_finalize(stmt);
    } else {
        reject(@"db_error", @"Failed to prepare statement", nil);
    }
}

RCT_EXPORT_METHOD(getAllTasks:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    const char *sql = "SELECT json FROM tasks;";
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

RCT_EXPORT_METHOD(deleteTask:(NSString *)taskId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    const char *sql = "DELETE FROM tasks WHERE id = ?";
    sqlite3_stmt *stmt;
    if (sqlite3_prepare_v2(_db, sql, -1, &stmt, NULL) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, [taskId UTF8String], -1, SQLITE_TRANSIENT);
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

@end
