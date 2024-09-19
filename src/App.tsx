import ContextMenu from "@components/ContextMenu";
import HistoryTable from "@components/HistoryTable";
import Loader from "@components/Loader";
import Nav from "@components/Nav";
import SettingsModal from "@components/Settings";
import Share from "@components/Share";
import { Locale } from "@shared";
import { Toaster } from "sonner";
import { useT } from "talkr";

function App() {
  const { T, locale } = useT();

  return (
    <>
      <Toaster richColors position="top-center" />
      <Loader />
      <ContextMenu />

      <nav>
        <Nav T={T} />
      </nav>
      <main className="space-y-6 pb-20">
        <Share T={T} />

        <HistoryTable locale={locale as Locale} T={T} />
      </main>

      <SettingsModal />
    </>
  );
}

export default App;
