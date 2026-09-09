package com.wattview.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = SolarYellow,
    onPrimary = Color.Black,
    primaryContainer = SolarYellowDark,
    onPrimaryContainer = Color.Black,
    secondary = BatteryGreen,
    onSecondary = Color.Black,
    secondaryContainer = BatteryGreenDark,
    onSecondaryContainer = BatteryGreenLight,
    tertiary = Color(0xFF03DAC5),
    background = DarkBackground,
    onBackground = TextPrimary,
    surface = DarkSurface,
    onSurface = TextPrimary,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = TextSecondary,
    error = BatteryRed,
    onError = Color.White,
)

private val LightColorScheme = lightColorScheme(
    primary = SolarYellowDark,
    onPrimary = Color.White,
    primaryContainer = SolarYellowLight,
    onPrimaryContainer = Color.Black,
    secondary = BatteryGreenDark,
    onSecondary = Color.White,
    secondaryContainer = BatteryGreenLight,
    onSecondaryContainer = Color.Black,
    tertiary = Color(0xFF018786),
    background = LightBackground,
    onBackground = TextPrimaryLight,
    surface = LightSurface,
    onSurface = TextPrimaryLight,
    surfaceVariant = LightSurfaceVariant,
    onSurfaceVariant = TextSecondaryLight,
    error = Color(0xFFB00020),
    onError = Color.White,
)

@Composable
fun WattViewTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
