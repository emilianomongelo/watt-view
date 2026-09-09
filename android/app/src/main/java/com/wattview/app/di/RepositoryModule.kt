package com.wattview.app.di

import com.wattview.app.data.repository.SolarRepository
import com.wattview.app.data.repository.SolarRepositoryImpl
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindSolarRepository(
        impl: SolarRepositoryImpl
    ): SolarRepository
}
