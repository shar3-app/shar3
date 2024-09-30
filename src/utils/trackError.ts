import { trackEvent } from '@aptabase/tauri';
import { ErrorEvent, TrackEvent } from '@shared';

export const trackError = async (type: ErrorEvent, error: any) => {
  return await trackEvent(TrackEvent.Error, {
    type,
    error,
    errorMessage: String(error),
    errorJSON: JSON.stringify(error)
  });
};
