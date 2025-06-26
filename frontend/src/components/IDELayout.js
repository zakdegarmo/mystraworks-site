import React from 'react';
import WebViewPane from './WebViewPane'; // Import WebViewPane
import WeaveVault from './WeaveVault'; // Import WeaveVault

const IDELayout = () => {
  return (
    <div className="flex h-screen">
      {/* File Explorer/Sidebar Pane - now including WeaveVault */}
      <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
        <WeaveVault /> {/* Include WeaveVault */}
      </div>

      {/* Main content area with WebViewPane and potentially other panes */}
      <div className="flex-1 flex flex-col">
        {/* WebViewPane */}
        <div className="flex-1">
           <WebViewPane />
        </div>

        {/* Placeholder for Code Editor or other main pane */}
        {/* <div className="flex-1 bg-white">Code Editor</div> */}

         {/* Placeholder for Chat or other bottom pane */}
         {/* <div className="h-1/3 bg-gray-300">Chat</div> */}
      </div>
    </div>
  );
};

export default IDELayout;