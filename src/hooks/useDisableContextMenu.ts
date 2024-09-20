import { useEffect } from 'react';

const useDisableContextMenu = () => {
  useEffect(() => {
    //document.addEventListener("contextmenu", (event) => event.preventDefault());
  });
};

export default useDisableContextMenu;
