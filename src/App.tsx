import ContextMenu from '@components/ContextMenu';
import HistoryList from '@components/HistoryList';
import Joyride from '@components/Joyride';
import Loader from '@components/Loader';
import Nav from '@components/Nav';
import SettingsModal from '@components/Settings';
import Share from '@components/Share';
import Splashscreen from '@components/Splashscreen';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Nav />

      <main className="space-y-6">
        <Share />
        <HistoryList />
      </main>

      <SettingsModal />
      <Joyride />
      <Toaster position="top-center" closeButton />
      <Loader />
      <ContextMenu />
      <Splashscreen />
    </>
  );
}

export default App;
