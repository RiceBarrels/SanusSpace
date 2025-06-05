import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const doubleHapticsImpact = async () => {
    if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        setTimeout(() => {
        Haptics.impact({ style: ImpactStyle.Medium });
        }, 150);
    }
};

const lightHapticsImpact = async () => {
    if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
    }
};

const mediumHapticsImpact = async () => {
    if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
    }
};

const heavyHapticsImpact = async () => {
    if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
    }
};  

export { doubleHapticsImpact, lightHapticsImpact, mediumHapticsImpact, heavyHapticsImpact };