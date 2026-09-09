package com.wattview.app.ui.screens.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wattview.app.data.datastore.SettingsDataStore
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsUiState(
    val apiUrl: String = "",
    val apiToken: String = "",
    val refreshInterval: Int = 30
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsDataStore: SettingsDataStore
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            combine(
                settingsDataStore.apiUrl,
                settingsDataStore.apiToken,
                settingsDataStore.refreshInterval
            ) { url, token, interval ->
                SettingsUiState(
                    apiUrl = url,
                    apiToken = token,
                    refreshInterval = interval
                )
            }.collect { state ->
                _uiState.value = state
            }
        }
    }

    fun updateApiUrl(url: String) {
        viewModelScope.launch {
            settingsDataStore.setApiUrl(url)
        }
    }

    fun updateApiToken(token: String) {
        viewModelScope.launch {
            settingsDataStore.setApiToken(token)
        }
    }

    fun updateRefreshInterval(seconds: Int) {
        viewModelScope.launch {
            settingsDataStore.setRefreshInterval(seconds)
        }
    }
}
