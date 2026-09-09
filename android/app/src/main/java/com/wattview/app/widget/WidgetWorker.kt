package com.wattview.app.widget

import android.content.Context
import androidx.glance.appwidget.updateAll
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.wattview.app.data.api.WattViewApi
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class WidgetWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted workerParams: WorkerParameters,
    private val api: WattViewApi
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            val status = api.getStatus()
            val inverterData = status.growatt.inverterData
            val temperature = status.weather?.temperature ?: 0.0

            val prefs = context.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE)
            prefs.edit().apply {
                putFloat("battery_soc", (inverterData?.batterySoc ?: 0f).toFloat())
                putFloat("pv_power", (inverterData?.pvPower ?: 0f).toFloat())
                putFloat("load_power", (inverterData?.loadPower ?: 0f).toFloat())
                putFloat("temperature", temperature.toFloat())
                putBoolean("is_charging", (inverterData?.batteryPower ?: 0.0) < 0)
                apply()
            }

            WattViewWidget().updateAll(context)
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
}
