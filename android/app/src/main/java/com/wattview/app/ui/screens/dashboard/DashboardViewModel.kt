package com.wattview.app.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wattview.app.data.api.SolarStatusResponse
import com.wattview.app.data.datastore.SettingsDataStore
import com.wattview.app.data.repository.SolarRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiState(
    val isLoading: Boolean = true,
    val status: SolarStatusResponse? = null,
    val error: String? = null,
    val isRefreshing: Boolean = false,
    val lastUpdated: Long = 0L
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: SolarRepository,
    private val settingsDataStore: SettingsDataStore
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadStatus()
        startAutoRefresh()
    }

    private fun startAutoRefresh() {
        viewModelScope.launch {
            while (isActive) {
                val interval = settingsDataStore.refreshInterval.first()
                delay(interval * 1000L)
                loadStatusSilent()
            }
        }
    }

    fun loadStatus() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val status = repository.getStatus()
                _uiState.value = DashboardUiState(
                    isLoading = false,
                    status = status,
                    lastUpdated = System.currentTimeMillis()
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Unknown error"
                )
            }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true)
            try {
                val status = repository.getStatus()
                _uiState.value = _uiState.value.copy(
                    isRefreshing = false,
                    status = status,
                    error = null,
                    lastUpdated = System.currentTimeMillis()
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isRefreshing = false,
                    error = e.message ?: "Refresh failed"
                )
            }
        }
    }

    private suspend fun loadStatusSilent() {
        try {
            val status = repository.getStatus()
            _uiState.value = _uiState.value.copy(
                status = status,
                error = null,
                lastUpdated = System.currentTimeMillis()
            )
        } catch (_: Exception) {
            // Silent refresh — don't overwrite existing data on failure
        }
    }
}
