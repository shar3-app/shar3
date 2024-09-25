import ContextMenu from '@components/ContextMenu';
import HistoryList from '@components/HistoryList';
import Joyride from '@components/Joyride';
import Loader from '@components/Loader';
import Nav from '@components/Nav';
import SettingsModal from '@components/Settings';
import Share from '@components/Share';
import { Toaster } from 'sonner';

function App() {
  // TODO splashscreen
  return (
    <>
      <Toaster position="top-center" closeButton />
      <Loader />
      <ContextMenu />

      <nav>
        <Nav />
      </nav>
      <main className="space-y-6 pb-20">
        <Share />

        <HistoryList />
      </main>

      <SettingsModal />
      <Joyride />
    </>
  );
}

export default App;
