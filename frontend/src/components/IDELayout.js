import React from 'react';
import WebViewPane from './WebViewPane'; // Import WebViewPane

const IDELayout = () => {
  return (
    <div className="flex h-screen">
      {/* Placeholder for File Explorer or Sidebar */}
      {/* <div className="w-1/4 bg-gray-200">File Explorer</div> */}

      {/* Main content area with WebViewPane and potentially other panes */}
      <div className="flex-1 flex">
        <WebViewPane />

        {/* Placeholder for Code Editor or other main pane */}
        {/* <div className="flex-1 bg-white">Code Editor</div> */}
      </div>

      {/* Placeholder for Chat or other right sidebar */}
      {/* <div className="w-1/4 bg-gray-300">Chat</div> */}
    </div>
  );
};

export default IDELayout;