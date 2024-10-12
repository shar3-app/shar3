import { openContextMenu } from '@components/ContextMenu';
import { useLocalStorage, useRerenderer } from '@hooks';
import { FileIcon, FolderIcon } from '@icons';
import { Events, History, HistoryItem, Locale, LocalStorage } from '@shared';
import { invoke } from '@tauri-apps/api/core';
import { emit, listen } from '@tauri-apps/api/event';
import { type } from '@tauri-apps/plugin-os';
import { from, getFileName } from '@utils';
import { MouseEvent as ME, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useT } from 'talkr';
import HistoryRow from './HistoryRow';

const HistoryList = () => {
  const { T, locale } = useT();
  const [visibleItems, setVisibleItems] = useState(5);
  const { value: history, setValue: setHistory } = useLocalStorage<History>(
    LocalStorage.History,
    []
  );

  // Rerenderer (10 secs)
  useRerenderer();

  useEffect(() => {
    const listenUpdateHistory = listen<History>(Events.UpdateHistory, ({ payload: newHistory }) =>
      setHistory((currentHistory) => [
        ...newHistory,
        ...currentHistory.filter((historyEntry) =>
          newHistory.some((newHistoryEntry) => newHistoryEntry.path !== historyEntry.path)
        )
      ])
    );
    const listenSetHistory = listen<History>(Events.SetHistory, ({ payload: newHistory }) =>
      setHistory(newHistory)
    );

    return () => {
      listenUpdateHistory.then((f) => f());
      listenSetHistory.then((f) => f());
    };
  }, []);

  const shareHistoryItem = (item: HistoryItem) => {
    emit(Events.Share, item.path);
  };

  const loadMore = (): void => {
    setVisibleItems((visibleCount) => visibleCount + 5);
  };

  const deleteHistoryEntry = (historyItem: HistoryItem) => {
    setHistory((currHistory) => currHistory.filter((hi) => hi.sharedAt !== historyItem.sharedAt));
    toast.success(
      T('toasts.delete_entry', {
        filename: getFileName(historyItem.path)
      })
    );
  };

  const contextMenu = (e: ME<HTMLLIElement, MouseEvent>, historyItem: HistoryItem): void => {
    e.preventDefault();
    openContextMenu(
      {
        x: e.clientX,
        y: e.clientY
      },
      [
        {
          label: T('contextmenu.reshare'),
          action: () => shareHistoryItem(historyItem)
        },
        {
          label: T('contextmenu.open_folder'),
          action: () => invoke('open', { path: historyItem.path, osType: type() })
        },
        {
          label: T('contextmenu.delete_entry'),
          action: () => deleteHistoryEntry(historyItem)
        }
      ]
    );
  };

  return (
    !!history.length && (
      <div id="share-history" className="rounded-lg border-2 border-gray-200 dark:border-gray-700">
        <ul className="flex text-sm text-left text-gray-600 dark:text-gray-400 w-full flex-col">
          {history.slice(0, visibleItems).map((historyItem, idx) => {
            return (
              <li
                key={idx}
                tabIndex={1}
                className={`flex py-[1.15rem] border-b last:border-b-0 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:cursor-pointer last:rounded-b-md first:rounded-t-md ${
                  idx % 2 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800'
                }`}
                onClick={() => shareHistoryItem(historyItem)}
                onKeyDown={(event) => {
                  if (['Enter', 'Space'].includes(event?.code)) shareHistoryItem(historyItem);
                }}
                onContextMenu={(e) => contextMenu(e, historyItem)}
              >
                <header className="flex w-4/6 lg:w-5/6 items-center space-x-5 pl-6 pr-4 rounfed font-medium text-gray-900 dark:text-white">
                  <div className="w-[20px]">
                    {historyItem.isDirectory ? (
                      <FolderIcon width={20} height={20} />
                    ) : (
                      <FileIcon width={20} height={20} />
                    )}
                  </div>
                  <div className="flex flex-col w-[80%]">
                    <p
                      className="overflow-hidden text-ellipsis"
                      title={getFileName(historyItem.path)}
                    >
                      {getFileName(historyItem.path)}
                    </p>
                    <span className="text-[.65rem] font-light whitespace-nowrap overflow-hidden text-ellipsis text-left rtl">
                      {type() === 'windows' ? historyItem.path : historyItem.path.replace('/', '')}
                    </span>
                  </div>
                </header>
                <time className="flex items-center pr-6 pl-4 w-2/6 lg:w-1/6 justify-end text-end">
                  {from(locale as Locale, new Date(historyItem.sharedAt))}
                </time>
              </li>
            );
          })}
          {history.length > visibleItems && (
            <HistoryRow
              key={history.length + 1}
              position={visibleItems % 2 ? 'even' : 'odd'}
              onKeyDown={(event) => {
                if (['Enter', 'Space'].includes(event?.code)) {
                  loadMore();
                }
              }}
              onClick={loadMore}
            >
              <p className="w-full text-center font-medium">Load more...</p>
            </HistoryRow>
          )}
        </ul>
      </div>
    )
  );
};

export default HistoryList;
