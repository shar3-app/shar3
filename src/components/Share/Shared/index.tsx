import Button from '@components/Button';
import { useTheme } from '@hooks';
import { CopyIcon, FileIcon, FolderIcon, MailIcon, TelegramIcon, WhatsappIcon } from '@icons';
import { SharePayload, Translator } from '@shared';
import { open } from '@tauri-apps/plugin-shell';
import { copyQrToClipboard, copyURLToClipboard, getFileName, shortenUrl } from '@utils';
import { Tooltip } from 'flowbite-react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import StopShare from '../StopShare';

interface SharedProps {
  onStop: () => void;
  shared: SharePayload;
  T: Translator;
}

const Shared = ({ shared, onStop, T }: SharedProps) => {
  const { theme } = useTheme();
  const qrId = 'share-qr-id';

  const copyToast = (promise: Promise<string>, loading: string) =>
    toast.promise(promise, {
      loading: T(loading),
      success: (success) => T(success),
      error: (error) => T(error)
    });

  return (
    <div className="flex w-full h-full items-center p-6 gap-8">
      <div className="flex flex-col h-full items-center w-1/2 min-[500px]:w-[40%] min-[560px]:w-[35%] transition-[width] duration-500">
        <Tooltip content={T('generic.copy_image')} placement="bottom" arrow={false}>
          <QRCode
            id={qrId}
            value={shared.url ?? ''}
            size={1024}
            bgColor={'transparent'}
            className="w-full h-full rounded-md cursor-pointer max-w-full"
            onClick={() => copyToast(copyQrToClipboard(qrId, theme), 'generic.qr_copied.loading')}
            fgColor={theme() === 'dark' ? '#b6c0ce' : '#3a4049'}
          />
        </Tooltip>
      </div>
      <div className="flex flex-col gap-6 text-[#101827] dark:text-white w-1/2 min-[500px]:w-[60%] min-[560px]:w-[65%] ">
        <div className="flex flex-col">
          <div className="flex gap-2">
            {shared.isDirectory ? (
              <FolderIcon className="w-5 h-5 -ml-0.5 mt-1" />
            ) : (
              <FileIcon className="w-5 h-5 -ml-1 mt-0.5" />
            )}
            <span className="block text-lg font-semibold whitespace-nowrap text-ellipsis overflow-hidden w-4/5">
              {getFileName(shared.path)}
            </span>
          </div>

          <div className="group flex cursor-pointer gap-1.5 w-full items-center text-[#3a4049] dark:text-[#b6c0ce]">
            <Tooltip content={T('generic.navigate_url')} placement="bottom" arrow={false}>
              <span className="text-sm group-hover:underline" onClick={() => open(shared.url)}>
                {shortenUrl(shared.url)}
              </span>
            </Tooltip>
            <Tooltip content={T('generic.copy_url')} placement="bottom" arrow={false}>
              <CopyIcon
                className="w-4"
                onClick={() =>
                  copyToast(copyURLToClipboard(shared.url), 'generic.url_copied.loading')
                }
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="mb-1.5 block text-sm">{T('generic.share')}</span>
          <div className="sharing-buttons flex flex-wrap gap-1">
            <Button
              onClick={() =>
                open(`https://wa.me/?text=${T('generic.share_url')}%20%0D%0A%0D%0A${shared.url}`)
              }
              aria-label="Share on Whatsapp"
              className="!w-10 h-10 flex items-center justify-center !p-0"
            >
              <WhatsappIcon className="w-5 h-5" />
            </Button>
            <Button
              onClick={() =>
                open(
                  `https://telegram.me/share/url?text=${T('generic.share_url')}&amp;url=${shared.url}`
                )
              }
              aria-label="Share on Telegram"
              className="!w-10 h-10 flex items-center justify-center !p-0"
            >
              <TelegramIcon className="w-5 h-5" />
            </Button>
            <Button
              onClick={() =>
                // TODO fix this link
                open(
                  `mailto:?subject=${T('generic.share_mail_subject')}&body=${T('generic.share_url')}%20%0D%0A%0D%0A${shared.url}`
                )
              }
              aria-label="Share by Email"
              className="!w-10 h-10 flex items-center justify-center !p-0"
            >
              <MailIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      <StopShare onStop={onStop} T={T} />
    </div>
  );
};

export default Shared;
