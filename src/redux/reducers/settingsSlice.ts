'use client';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { SettingsData } from '@/hooks/queries/useSettings';
// import { WebSettings } from '@/utils/api/general/getSettings';

const initialState = {
    data: {} as SettingsData,
    fcmtoken: "",
    lastFetch: null
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSettings: (state, action: PayloadAction<any>) => {
            state.data = action.payload
        },
        setFcmTokenData: (state, action: PayloadAction<string>) => {
            state.fcmtoken = action.payload
        },
        setSettingsLastFetch: (state, action) => {
            state.lastFetch = action.payload
        },
    },
});

export const { setFcmTokenData, setSettings, setSettingsLastFetch } = settingsSlice.actions;
export default settingsSlice.reducer;

export const dataSelector = (state: RootState) => state.settings

export const settingsSelector = createSelector(dataSelector, state => state.data)
export const businessModeSelector = createSelector(dataSelector, state => state.data?.basic_details)
export const bookingModeSelector = createSelector(
  businessModeSelector,
  (basic) => basic?.booking_mode ?? (basic?.property_type === 'Resort' ? 'sunbed' : 'hotel')
)
export const fcmTokenSelector = createSelector(dataSelector, state => state.fcmtoken)
export const settingsLastFetchSelector = createSelector(dataSelector, state => state.lastFetch)
export const languagesSelector = createSelector(dataSelector, state => state.data?.languages)
export const referralSettingsSelector = createSelector(dataSelector, state => state.data?.referral_settings)
export const demoModeSelector = createSelector(dataSelector, state => state.data?.general_config?.demo_mode)
