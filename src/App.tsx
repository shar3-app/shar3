import ContextMenu from "@components/ContextMenu";
import HistoryTable from "@components/HistoryTable";
import Loader from "@components/Loader";
import Nav from "@components/Nav";
import SettingsModal from "@components/Settings";
import Share from "@components/Share";
import { useConnection, useLocalStorage } from "@hooks";
import { History, Locale } from "@shared";
import { toggleScroll } from "@utils";
import { useState } from "react";
import { Toaster } from "sonner";
import { useT } from "talkr";

function App() {
  const [settings, toggleSettings] = useState(false);
  const { value: history, setValue: setHistory } = useLocalStorage<History>(
    "history",
    [],
  );
  const isConnected = useConnection();
  const { T, locale } = useT();

  return (
    <>
      <Toaster richColors position="top-center" />
      <Loader />
      <ContextMenu />

      <nav>
        <Nav
          toggleSettings={(state) => {
            toggleSettings(state);
            toggleScroll(!state);
          }}
          T={T}
          isConnected={isConnected}
        />
      </nav>
      <main className="space-y-6 pb-20">
        <Share setHistory={setHistory} T={T} isConnected={isConnected} />

        {!!history?.length && (
          <HistoryTable
            history={history}
            locale={locale as Locale}
            setHistory={setHistory}
            T={T}
          />
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        setHistory={setHistory}
        show={settings}
        onClose={() => {
          toggleSettings(false);
          toggleScroll(true);
        }}
      />
      {/*<SharingModal shared={shared} onStop={stopSharing} />*/}

      {/*<Update/>*/}
    </>
  );
}

export default App;
