import { useMemo } from 'react';
import { useGetSettingsQuery } from '../redux/features/settings/settingsApi';
import { ALL_AUDIENCE_KEYS, AUDIENCE_THEME, DEFAULT_THEME, audienceCopy } from '../data/catalog';
import { heroCouple } from '../assets/images';

// Single source of truth for which audiences the storefront serves, plus the
// derived branding (hero copy/image) that re-skins the store to those audiences.
// RTK Query dedupes useGetSettingsQuery, so calling this in many components is fine.
export const useActiveAudiences = () => {
    const { data } = useGetSettingsQuery();
    const settings = data?.data?.settings;

    return useMemo(() => {
        const raw = settings?.activeAudiences;
        // Keep canonical order; fall back to all audiences when unset/empty.
        const set = Array.isArray(raw) && raw.length ? raw : ALL_AUDIENCE_KEYS;
        const keys = ALL_AUDIENCE_KEYS.filter((k) => set.includes(k));
        const active = keys.length ? keys : ALL_AUDIENCE_KEYS;
        const isActive = (key) => active.includes(key);

        // Branding: single audience -> its theme; otherwise the default/blended store.
        const primary = active[0];
        const single = active.length === 1;
        const theme = single ? AUDIENCE_THEME[primary] : DEFAULT_THEME;
        const heroImages = settings?.audienceHeroImages || {};
        const heroImage = heroImages[primary] || heroCouple;

        const storeBranding = {
            eyebrow: theme.eyebrow,
            headline: theme.headline,
            tagline: single ? theme.tagline : `Elevated fashion for ${audienceCopy(active)} — all in one place.`,
            cta: theme.cta,
            ctaTo: theme.to,
            image: heroImage,
            primary,
        };

        return { keys: active, isActive, settings, storeBranding, copy: audienceCopy(active) };
    }, [settings]);
};

export default useActiveAudiences;
