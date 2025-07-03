# BuildTools Utilities - Complete Self-Contained Solution

This utility provides automatic download, extraction, and usage of Microsoft Windows SDK BuildTools with zero manual setup required.

## 🚀 **Key Features**

- **🔄 Auto-Download**: Automatically downloads and extracts BuildTools if not found
- **🏗️ Architecture Detection**: Uses the correct tools for your system architecture (x64, x86, arm64)
- **📦 Self-Contained**: No external dependencies - uses only Node.js built-in modules
- **🔧 Reusable**: One utility works across all your scripts and projects
- **⚡ Smart Caching**: Downloads once, reuses everywhere

## 📁 **Files Overview**

### Core Utility
- **`buildtools/buildtools-utils.js`** - Main utility with auto-download functionality
- **`buildtools/run-buildtool.js`** - Generic script runner for NPM scripts

### Usage Examples
- **`embed-app-manifest.js`** - Embed manifests using `mt.exe`
- **`buildtools/sign-executable.js`** - Code signing using `signtool.exe`
- **`buildtools/create-package.js`** - Create APPX/MSIX packages using `makeappx.exe`
- **`buildtools/misc-tools.js`** - Various BuildTools utilities

### Testing
- **`buildtools/test-buildtools.js`** - Test and validate the auto-download functionality

## 🔧 **Quick Start**

### 1. Basic Usage
```javascript
const { execSyncWithBuildTools } = require("./buildtools/buildtools-utils");

// Use any BuildTool - will auto-download if needed
await execSyncWithBuildTools('mt.exe -manifest app.manifest -outputresource:app.exe');
await execSyncWithBuildTools('signtool.exe sign /f cert.pfx app.exe');
await execSyncWithBuildTools('makeappx.exe pack /d source /p output.appx');
```

### 2. NPM Scripts Usage (Recommended)
```json
{
  "scripts": {
    "make-msix": "node buildtools/run-buildtool.js makeappx.exe pack /o /d \"./msix\" /nv /p \"./dist/SparseExample.msix\"",
    "sign-app": "node buildtools/run-buildtool.js signtool.exe sign /f cert.pfx app.exe",
    "embed-manifest": "node buildtools/run-buildtool.js mt.exe -manifest app.manifest -outputresource:app.exe"
  }
}
```

Then run: `npm run make-msix`

### 3. Get Tool Path
```javascript
const { getBuildToolPath } = require("./buildtools/buildtools-utils");

// Get full path to specific tool
const mtPath = await getBuildToolPath('mt.exe');
console.log(`mt.exe is at: ${mtPath}`);
```

### 4. Ensure BuildTools Available
```javascript
const { ensureBuildTools } = require("./buildtools/buildtools-utils");

// Ensure BuildTools are downloaded and ready
const binPath = await ensureBuildTools();
console.log(`BuildTools ready at: ${binPath}`);
```

## 🛠️ **Available Functions**

### `execSyncWithBuildTools(command, options)`
Execute any command with BuildTools in PATH. Auto-downloads if needed.
- **`command`**: Shell command to execute
- **`options`**: Options passed to execSync
- **Returns**: Buffer with command output

### `getBuildToolPath(toolName)`
Get the full path to a specific BuildTool executable.
- **`toolName`**: Name of the tool (e.g., 'mt.exe', 'signtool.exe')
- **Returns**: Full path to the executable

### `ensureBuildTools()`
Ensure BuildTools are available, download if necessary.
- **Returns**: Path to BuildTools bin directory

### `downloadAndExtractBuildTools()`
Manually trigger BuildTools download and extraction.

## 📋 **Available Tools**

The BuildTools package includes many useful tools:

### **Manifest & Resources**
- `mt.exe` - Manifest Tool
- `rc.exe` - Resource Compiler
- `makecat.exe` - Catalog File Maker

### **Code Signing**
- `signtool.exe` - Digital Signature Tool
- `MakeCert.exe` - Certificate Creation Tool

### **Packaging**
- `makeappx.exe` - APPX/MSIX Package Tool
- `makepri.exe` - Package Resource Index Tool

### **Development**
- `midl.exe` - MIDL Compiler
- `uuidgen.exe` - UUID Generator
- `tracewpp.exe` - WPP Tracing

### **And Many More...**
Run `node misc-tools.js` and call `listAvailableTools()` to see all available tools.

## 🏗️ **Architecture Support**

The utility automatically detects your system architecture and uses the appropriate tools:

- **x64**: 64-bit Windows (most common)
- **x86**: 32-bit Windows 
- **arm64**: ARM64 Windows

If your preferred architecture isn't available, it gracefully falls back to compatible alternatives.

## 📦 **How It Works**

1. **Search**: Looks for existing BuildTools folder in current/parent directories
2. **Download**: If not found, automatically downloads latest version from NuGet
3. **Extract**: Extracts using PowerShell's `Expand-Archive`
4. **Cleanup**: Removes downloaded .nupkg file after extraction
5. **Cache**: Subsequent runs use the existing installation

## ⚡ **Example Scripts**

### NPM Scripts (Recommended Approach)
```json
// package.json
{
  "scripts": {
    "make-msix": "node buildtools/run-buildtool.js makeappx.exe pack /o /d \"./msix\" /nv /p \"./dist/SparseExample.msix\"",
    "sign-app": "node buildtools/run-buildtool.js signtool.exe sign /f cert.pfx /p password app.exe",
    "embed-manifest": "node buildtools/run-buildtool.js mt.exe -manifest app.manifest -outputresource:app.exe",
    "create-uuid": "node buildtools/run-buildtool.js uuidgen.exe"
  }
}
```

Then simply run:
```bash
npm run make-msix
npm run sign-app
npm run embed-manifest
```

### Direct JavaScript Usage

### Embed Application Manifest
```javascript
// embed-app-manifest.js
const { execSyncWithBuildTools } = require("./buildtools/buildtools-utils");

module.exports = async function(context) {
  const exe = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
  const manifest = path.resolve(__dirname, "app.manifest");
  
  await execSyncWithBuildTools(`mt.exe -nologo -manifest "${manifest}" -outputresource:"${exe}"`);
};
```

### Sign Executable
```javascript
// buildtools/sign-executable.js
const { execSyncWithBuildTools } = require("./buildtools-utils");

async function signExecutable(exePath, certPath, certPassword) {
  const command = `signtool.exe sign /f "${certPath}" /p "${certPassword}" /fd SHA256 "${exePath}"`;
  await execSyncWithBuildTools(command, { stdio: 'inherit' });
}
```

### Create APPX Package
```javascript
// buildtools/create-package.js
const { execSyncWithBuildTools } = require("./buildtools-utils");

async function createAppxPackage(sourceDir, outputPath, manifestPath) {
  const command = `makeappx.exe pack /d "${sourceDir}" /p "${outputPath}" /m "${manifestPath}"`;
  await execSyncWithBuildTools(command, { stdio: 'inherit' });
}
```

## 🧪 **Testing**

Run the test script to verify everything works:

```bash
node buildtools/test-buildtools.js
```

This will:
1. Auto-download BuildTools if needed
2. Test `mt.exe` functionality
3. Test `signtool.exe` functionality
4. Confirm all tools are working

## 🔄 **Migration from Original Scripts**

### Before (Manual Path Management)
```javascript
const mtExePath = "C:\\Program Files\\Windows Kits\\10\\bin\\10.0.19041.0\\x64\\mt.exe";
execSync(`"${mtExePath}" -manifest app.manifest -outputresource:app.exe`);
```

### After (Auto-Download & Path Management)
**Option 1: Direct JavaScript**
```javascript
const { execSyncWithBuildTools } = require("./buildtools/buildtools-utils");
await execSyncWithBuildTools('mt.exe -manifest app.manifest -outputresource:app.exe');
```

**Option 2: NPM Scripts (Recommended)**
```json
{
  "scripts": {
    "embed-manifest": "node buildtools/run-buildtool.js mt.exe -manifest app.manifest -outputresource:app.exe"
  }
}
```

## 📁 **Project Structure**
```
project/
├── buildtools-utils.js          # Core utility
├── embed-app-manifest.js        # Manifest embedding example
├── sign-executable.js           # Code signing example
├── create-package.js            # Package creation example
├── misc-tools.js               # Various tools example
├── test-buildtools.js          # Testing script
└── Microsoft.Windows.SDK.BuildTools/  # Auto-downloaded (after first run)
    └── bin/
        └── 10.0.26100.0/
            ├── x64/            # 64-bit tools
            ├── x86/            # 32-bit tools
            └── arm64/          # ARM64 tools
```

## 🛡️ **Error Handling**

The utility includes comprehensive error handling:

- **Network Issues**: Graceful failure with clear error messages
- **Missing Tools**: Automatic download and retry
- **Architecture Mismatch**: Automatic fallback to compatible architecture
- **Extraction Failures**: Detailed error reporting
- **Command Failures**: Proper exit code handling

## 🎯 **Use Cases**

- **Electron Apps**: Embed manifests, sign executables
- **Desktop Apps**: Create APPX/MSIX packages
- **Build Scripts**: Automate Windows development tasks
- **CI/CD Pipelines**: Self-contained build environments
- **Development Tools**: Resource compilation, certificate creation

## 🚀 **Benefits**

- **Zero Setup**: No manual SDK installation required
- **Portable**: Works on any Windows machine with Node.js
- **Consistent**: Same tools, same versions across environments
- **Fast**: Downloads once, reuses everywhere
- **Reliable**: Built-in fallbacks and error handling

This solution transforms Windows development from manual tool management to automatic, self-contained operations! 🎉
