package com.wattview.app.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

class WattViewWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val prefs = context.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE)
        val batterySoc = prefs.getFloat("battery_soc", 0f).toDouble()
        val pvPower = prefs.getFloat("pv_power", 0f).toDouble()
        val loadPower = prefs.getFloat("load_power", 0f).toDouble()
        val temperature = prefs.getFloat("temperature", 0f).toDouble()
        val isCharging = prefs.getBoolean("is_charging", false)

        provideContent {
            GlanceTheme {
                WidgetContent(
                    batterySoc = batterySoc,
                    pvPower = pvPower,
                    loadPower = loadPower,
                    temperature = temperature,
                    isCharging = isCharging
                )
            }
        }
    }
}

@Composable
private fun WidgetContent(
    batterySoc: Double,
    pvPower: Double,
    loadPower: Double,
    temperature: Double,
    isCharging: Boolean
) {
    val socColor = when {
        batterySoc >= 60 -> ColorProvider(Color(0xFF4CAF50))
        batterySoc >= 20 -> ColorProvider(Color(0xFFFF9800))
        else -> ColorProvider(Color(0xFFEF5350))
    }

    Row(
        modifier = GlanceModifier
            .fillMaxSize()
            .cornerRadius(16.dp)
            .background(Color(0xFF1E1E1E))
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Battery SOC
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "${batterySoc.toInt()}%",
                style = TextStyle(
                    color = socColor,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Text(
                text = if (isCharging) "Chrg" else "Dischrg",
                style = TextStyle(
                    color = ColorProvider(Color(0xFF9E9E9E)),
                    fontSize = 10.sp
                )
            )
        }

        Spacer(modifier = GlanceModifier.width(16.dp))

        // Divider
        Column(
            modifier = GlanceModifier
                .width(1.dp)
                .height(36.dp)
                .background(Color(0xFF333333))
        ) {}

        Spacer(modifier = GlanceModifier.width(16.dp))

        // PV Power
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "PV",
                style = TextStyle(
                    color = ColorProvider(Color(0xFFFFB300)),
                    fontSize = 10.sp
                )
            )
            Text(
                text = "${String.format("%.2f", pvPower / 1000)} kW",
                style = TextStyle(
                    color = ColorProvider(Color(0xFFE0E0E0)),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            )
        }

        Spacer(modifier = GlanceModifier.width(12.dp))

        // Load Power
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Load",
                style = TextStyle(
                    color = ColorProvider(Color(0xFF4CAF50)),
                    fontSize = 10.sp
                )
            )
            Text(
                text = "${String.format("%.2f", loadPower / 1000)} kW",
                style = TextStyle(
                    color = ColorProvider(Color(0xFFE0E0E0)),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            )
        }

        Spacer(modifier = GlanceModifier.weight(1f))

        // Temperature
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "${String.format("%.0f", temperature)}°C",
                style = TextStyle(
                    color = ColorProvider(Color(0xFFE0E0E0)),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
            )
        }
    }
}
