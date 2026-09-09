package com.wattview.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.wattview.app.ui.screens.dashboard.DashboardScreen
import com.wattview.app.ui.screens.history.HistoryScreen
import com.wattview.app.ui.screens.settings.SettingsScreen
import kotlinx.serialization.Serializable

sealed class Screen {
    @Serializable
    data object Dashboard

    @Serializable
    data object History

    @Serializable
    data object Settings
}

@Composable
fun AppNavigation(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard,
        modifier = modifier
    ) {
        composable<Screen.Dashboard> {
            DashboardScreen()
        }
        composable<Screen.History> {
            HistoryScreen()
        }
        composable<Screen.Settings> {
            SettingsScreen()
        }
    }
}
