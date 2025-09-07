import {
    ActivityData,
    CapacitorHealthkit,
    OtherData,
    QueryOutput,
    SampleNames,
    SleepData,
} from '@perfood/capacitor-healthkit';
import { Capacitor } from '@capacitor/core';
  
export async function requestAuthorization() {
  try {
    if (Capacitor.getPlatform() === 'ios') {
      await CapacitorHealthkit.requestAuthorization({
        all: [''],
        read: ['calories', 'stairs', 'activity', 'steps', 'distance', 'duration', 'weight', 'sleep'],
        write: [''],
      });
    }

  } catch (error) {
    console.error('[HealthKitService] Error getting Authorization:', error);
  }
}

export async function getActivityData(
  startDate,
  endDate = new Date(),
) {
  try {
    const queryOptions = {
      sampleName: SampleNames.WORKOUT_TYPE,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 0,
    };

    const result = await CapacitorHealthkit.queryHKitSampleType(queryOptions);
    console.log('HealthKit Activity Raw Result:', result);
    return result;
  } catch (error) {
    console.error('HealthKit Activity Error:', error);
    return { resultData: [], countReturn: 0 };
  }
}

export async function getSleepData(
  startDate,
  endDate = new Date(),
) {
  try {
    const queryOptions = {
      sampleName: SampleNames.SLEEP_ANALYSIS,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 0,
    };

    console.log('HealthKit Sleep Query Options:', queryOptions);
    const result = await CapacitorHealthkit.queryHKitSampleType(queryOptions);
    console.log('HealthKit Sleep Raw Result:', result);
    console.log('Sleep data count:', result?.countReturn || 0);
    console.log('Sleep result data length:', result?.resultData?.length || 0);
    return result;
  } catch (error) {
    console.error('HealthKit Sleep Error:', error);
    return { resultData: [], countReturn: 0 };
  }
}

export async function getCaloriesData(
  startDate,
  endDate = new Date(),
) {
  try {
    const queryOptions = {
      sampleName: SampleNames.ACTIVE_ENERGY_BURNED,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 0,
    };

    const result = await CapacitorHealthkit.queryHKitSampleType(queryOptions);
    console.log('HealthKit Calories Raw Result:', result);
    return result;
  } catch (error) {
    console.error('HealthKit Calories Error:', error);
    return { resultData: [], countReturn: 0 };
  }
}

export async function getStepsData(
  startDate,
  endDate = new Date(),
) {
  try {
    const queryOptions = {
      sampleName: SampleNames.STEP_COUNT,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 0,
    };

    const result = await CapacitorHealthkit.queryHKitSampleType(queryOptions);
    console.log('HealthKit Steps Raw Result:', result);
    return result;
  } catch (error) {
    console.error('HealthKit Steps Error:', error);
    return { resultData: [], countReturn: 0 };
  }
}