const fs = require('fs-extra');
const path = require('path');

module.exports = async (context) => {
  // context.electronPlatformName: 'win32', 'darwin', 'linux'
  // context.target.name: 'nsis', 'portable', etc. (sometimes undefined if not installer build)

  if (context.target && context.target.name !== undefined) {
    // Copy your file only for packaged target
    await fs.copy(
      path.join(__dirname, 'app.manifest'),
      path.join(context.appOutDir, `${context.packager.appInfo.productName}.exe.manifest`)
    );
  }
};