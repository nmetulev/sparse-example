
const path = require("path");
const { execSyncWithBuildTools } = require("./buildtools/buildtools-utils");

module.exports = async function(context) {
  const exe = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.exe`
  );
  const manifest = path.resolve(__dirname, "app.manifest");
  
  await execSyncWithBuildTools(
    `mt.exe -nologo -manifest "${manifest}" -outputresource:"${exe}"`
  );
};