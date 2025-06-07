import 'expo-router/entry'
import { AppRegistry } from 'react-native'
import GoogleSyncTask from './background/GoogleSyncTask'

AppRegistry.registerHeadlessTask('GoogleCalendarSync', () => GoogleSyncTask)
