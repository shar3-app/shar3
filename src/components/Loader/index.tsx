import { LoaderState } from '@shared';
import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import './loader.css';

const Loader = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const startLoading = () => {
    document.documentElement.style.overflowY = 'hidden';
    setLoading(true);
  };
  const stopLoading = () => {
    document.documentElement.style.overflowY = 'auto';
    setLoading(false);
  };

  useEffect(() => {
    const listenStartLoader = listen(LoaderState.Loading, () => startLoading());
    const listenStopLoader = listen(LoaderState.StopLoading, () => stopLoading());

    return () => {
      listenStartLoader.then((f) => f());
      listenStopLoader.then((f) => f());
    };
  }, []);

  return (
    <div
      className={`${loading ? '' : 'hidden'} fixed top-0 left-0 w-screen h-[102vh] flex items-center justify-center z-[1000] bg-[rgba(0,0,0,.4)]`}
    >
      <svg className="ring-loader" viewBox="25 25 50 50" strokeWidth="5">
        <circle cx="50" cy="50" r="20" />
      </svg>
    </div>
  );
};

export default Loader;
