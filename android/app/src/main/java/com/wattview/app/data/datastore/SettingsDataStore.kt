package com.wattview.app.data.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "wattview_settings")

class SettingsDataStore(
    private val context: Context
) {
    companion object {
        val API_URL = stringPreferencesKey("api_url")
        val API_TOKEN = stringPreferencesKey("api_token")
        val REFRESH_INTERVAL = intPreferencesKey("refresh_interval")
    }

    val apiUrl: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[API_URL] ?: "http://209.46.125.190/api"
    }

    val apiToken: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[API_TOKEN] ?: "73f42ef8-263b-4fee-9c1e-a55208639f3e"
    }

    val refreshInterval: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[REFRESH_INTERVAL] ?: 30
    }

    suspend fun setApiUrl(url: String) {
        context.dataStore.edit { prefs ->
            prefs[API_URL] = url
        }
    }

    suspend fun setApiToken(token: String) {
        context.dataStore.edit { prefs ->
            prefs[API_TOKEN] = token
        }
    }

    suspend fun setRefreshInterval(seconds: Int) {
        context.dataStore.edit { prefs ->
            prefs[REFRESH_INTERVAL] = seconds
        }
    }
}
