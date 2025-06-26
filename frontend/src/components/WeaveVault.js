
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { list_files } from '../../../default_api'; // Assuming list_files is available
// @ts-ignore
import path from 'path-browserify';

// Define props type for WeaveVault
interface WeaveVaultProps {
  onFileSelect?: (filePath: string) => void;
}

// Accept onFileSelect prop
const WeaveVault: React.FC<WeaveVaultProps> = ({ onFileSelect }) => {
  const [shards, setShards] = useState<any[]>([]); // State to hold the list of files/directories
  const [currentPath, setCurrentPath] = useState('.'); // State to hold the current path

  useEffect(() => {
    // Function to fetch file/directory data (shards)
    const fetchShards = async () => {
      try {
        // Use the currentPath state to list files in the current directory
        // @ts-ignore
        const response = await list_files({ path: currentPath });
        if (response && response.list_files_response && response.list_files_response.result) {
          const fileNames = JSON.parse(response.list_files_response.result);

          // Filter out '.' and '..' entries if they appear in the list_files output
          const filteredFileNames = fileNames.filter((name: string) => name !== '.' && name !== '..');

          // Map file names to shard objects
          const newShards = filteredFileNames.map((name: string, index: number) => ({
            id: index, // Simple index as ID for now
            name: name,
            // Basic check for directory vs file
            is_directory: !name.includes('.') || !name.toLowerCase().endsWith('.html') // Assuming .html are files
          }));
          setShards(newShards);
        } else {
          console.error('Error fetching file list: Invalid response format', response);
          setShards([]); // Set to empty array on error
        }
      } catch (error) {
        console.error('Error fetching file list:', error);
        setShards([]); // Set to empty array on error
      }
    };

    fetchShards(); // Fetch data whenever currentPath changes

  }, [currentPath]); // Dependency array includes currentPath

  // Handle click on a shard
  const handleShardClick = (shard: any) => {
    const fullPath = path.join(currentPath, shard.name); // Get the full path

    if (shard.is_directory) {
      // Navigate into the directory
      setCurrentPath(fullPath);
    } else {
      // It's a file - check if it's an HTML file
      if (shard.name.toLowerCase().endsWith('.html')) {
        console.log('Clicked on HTML file:', fullPath);
        // Call the onFileSelect prop with the full path
        if (onFileSelect) {
          onFileSelect(fullPath);
        }
      } else {
        console.log('Clicked on non-HTML file:', fullPath);
        // TODO: Handle other file types (e.g., open in code editor)
      }
    }
  };

  // Handle going back to the parent directory
  const handleGoUp = () => {
    // Only go up if not in the root directory
    if (currentPath !== '.') {
      const parentPath = path.dirname(currentPath); // Use path.dirname to get the parent path
      setCurrentPath(parentPath === '.' ? '.' : parentPath); // Ensure we don't go above the root represented by '.'
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg overflow-y-auto h-full" style={{ fontFamily: 'Arial, sans-serif' }}>
      <h2 className="text-xl font-bold mb-4">Weave Vault</h2>

      {/* Current Path and Go Up button */}
      <div className="mb-4 flex items-center">
        <span className="text-sm text-gray-400 mr-2">Current Path: /{currentPath}</span>
        {currentPath !== '.' && (
          <button
            className="px-2 py-1 bg-gray-600 rounded-md text-xs hover:bg-gray-500 active:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            onClick={handleGoUp}
            aria-label="Go to parent directory"
          >
            Go Up
          </button>
        )}
      </div>


      <div className="grid grid-cols-1 gap-2">
        {shards.map((shard) => (
          <div
            key={shard.id}
            className="p-2 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => handleShardClick(shard)} // Add click handler
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleShardClick(shard);}}
            tabIndex={0} // Make it focusable
            role="button"
            aria-label={`Select ${shard.is_directory ? 'directory' : 'file'} ${shard.name}`}
          >
            {/* Placeholder for shard icon */}
            <div className="mr-2" aria-hidden="true">{shard.is_directory ? '📂' : '📄'}</div> {/* Different icons for directory/file */}
            <span>{shard.name}</span>
          </div>
        ))}
      </div>
      {shards.length === 0 && currentPath === '.' && (
        <p className="text-center text-gray-400">Weave Vault is empty or loading...</p>
      )}
      {shards.length === 0 && currentPath !== '.' && ( 
         <p className="text-center text-gray-400">This directory is empty.</p>
      )}
    </div>
  );
};

// Default export for usage in other parts of the application if necessary
export default WeaveVault;

// Example of how to render this component if index.tsx is the main entry point
// This part would typically be in a main App.tsx or index.tsx that mounts to DOM.
// For this tool's structure, exporting the component might be sufficient if index.html handles mounting.
// If direct rendering is needed:
// import ReactDOM from 'react-dom/client';
// const rootElement = document.getElementById('root');
// if (rootElement) {
//   const root = ReactDOM.createRoot(rootElement);
//   // Example: <WeaveVault onFileSelect={(filePath) => console.log('File selected:', filePath)} />
//   root.render(
//     <React.StrictMode>
//       <WeaveVault onFileSelect={(filePath) => alert(`File selected: ${filePath}`)} />
//     </React.StrictMode>
//   );
// } else {
//   console.error("Failed to find the root element");
// }
// For now, let's assume the build system or index.html handles rendering the exported component.
// If this `index.tsx` is the direct entry point that needs to render, the above ReactDOM code would be necessary.
// Given the problem statement, we'll stick to providing the component as an ES6 module.
// The `list_files` function would need to be provided in the execution environment.
// For example, it could be a global function or a mock for development.
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.list_files = window.list_files || async function(params) {
    console.warn("list_files called with params:", params, "Using mock response.");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    if (params.path === '.') {
      return { list_files_response: { result: JSON.stringify(['mydir', 'index.html', 'script.js', 'image.png']) } };
    }
    if (params.path === './mydir' || params.path === 'mydir') {
      return { list_files_response: { result: JSON.stringify(['another.html', 'subdir']) } };
    }
    if (params.path === './mydir/subdir' || params.path === 'mydir/subdir') {
      return { list_files_response: { result: JSON.stringify([]) } };
    }
    return { list_files_response: { result: JSON.stringify([]) } };
  };
}
// This makes the component directly renderable for quick testing if this file is treated as the main app script.
// Ensure you have a div with id="root" in your index.html
if (typeof document !== 'undefined' && document.getElementById('root') && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    // @ts-ignore
    const ReactDOM = (window as any).ReactDOM || (React as any).ReactDOM; // Handle potential UMD import
    const rootElement = document.getElementById('root');
    if (rootElement && ReactDOM && typeof ReactDOM.createRoot === 'function') {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            React.createElement(React.StrictMode, null,
                React.createElement(WeaveVault, { onFileSelect: (filePath: string) => { alert(`File selected from WeaveVault: ${filePath}`); console.log('File selected:', filePath); } })
            )
        );
    } else if (rootElement && ReactDOM && typeof ReactDOM.render === 'function') { // Fallback for older React
         ReactDOM.render(
            React.createElement(React.StrictMode, null,
                React.createElement(WeaveVault, { onFileSelect: (filePath: string) => { alert(`File selected from WeaveVault: ${filePath}`); console.log('File selected:', filePath); } })
            ),
            rootElement
        );
    }
}
