import ContextMenu from '@components/ContextMenu';
import HistoryTable from '@components/HistoryTable';
import Loader from '@components/Loader';
import Nav from '@components/Nav';
import SettingsModal from '@components/Settings';
import Share from '@components/Share';
import { Toaster } from 'sonner';

function App() {
  // TODO splashscreen
  return (
    <>
      <Toaster richColors position="top-center" />
      <Loader />
      <ContextMenu />

      <nav>
        <Nav />
      </nav>
      <main className="space-y-6 pb-20">
        <Share />

        <HistoryTable />
      </main>

      <SettingsModal />
    </>
  );
}

export default App;
