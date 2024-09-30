import { Translator } from '@shared';
import { toast } from 'sonner';

export const noConnectionError = (T: Translator) => {
  toast.error(T('toasts.no_connection'));
};
