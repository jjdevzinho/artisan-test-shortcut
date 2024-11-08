# Development Guide

This guide provides instructions for developing and testing the Artisan Test Shortcut extension.

## Prerequisites

- Node.js and npm installed
- Visual Studio Code installed
- `vsce` (Visual Studio Code Extension Manager) installed globally

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/jjdevzinho/artisan-test-shortcut.git
   cd artisan-test-shortcut

   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Building the Extension

1. Open the project in Visual Studio Code::

   ```sh
   code .

   ```

2. Compile the TypeScript code:

   ```sh
   tsc

   ```

3. To package the extension into a .vsix file, run:

   ```sh
   vsce package

   ```

4. Press `F5` to open a new VS Code window with the extension loaded.

## Testing the Extension

To test the extension:

1. Open the project in Visual Studio Code.
2. Press `F5` to open a new VS Code window with the extension loaded.
3. Use the keyboard shortcuts to test the commands.

## Contribution

Feel free to contribute with improvements or fixes. Fork the repository, create a branch for your changes, and submit a pull request.
