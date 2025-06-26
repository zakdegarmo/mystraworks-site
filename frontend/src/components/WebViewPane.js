import React from 'react';

const WebViewPane = () => {
  // TODO: Add WebSocket logic here to listen for file changes and reload the webview

  return (
    <div className="w-1/2 h-screen border border-gray-300">
      <webview src="http://localhost:3000" className="w-full h-full"></webview>
    </div>
  );
};

export default WebViewPane;