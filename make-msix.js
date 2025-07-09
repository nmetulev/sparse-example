const { execSyncWithBuildTools } = require("./buildtools/buildtools-utils");
const fs = require("fs");
const path = require("path");

/**
 * MSIX Package Builder
 * 
 * This script creates an MSIX package using the Windows SDK BuildTools.
 * It performs the following steps:
 * 1. Creates dist/win-unpacked directory structure
 * 2. Copies appxmanifest-full.xml to the package folder as appxmanifest.xml
 * 3. Copies assets folder to the package folder
 * 4. Cleans up any existing config/pri files
 * 5. Runs makepri createconfig to create a PRI configuration file
 * 6. Runs makepri new to generate a new PRI file
 * 7. Runs makeappx pack to create the final MSIX package
 * 8. Cleans up temporary files
 */

const DIST_DIR = path.join(__dirname, "dist");
const PACKAGE_DIR = path.join(DIST_DIR, "win-unpacked");
const MSIX_SOURCE_DIR = path.join(__dirname, "msix");
const ASSETS_SOURCE_DIR = path.join(MSIX_SOURCE_DIR, "assets");
const ASSETS_DEST_DIR = path.join(PACKAGE_DIR, "assets");

async function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

async function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`Copied: ${source} -> ${destination}`);
  } catch (error) {
    throw new Error(`Failed to copy file ${source} to ${destination}: ${error.message}`);
  }
}

async function copyDirectory(source, destination) {
  try {
    // Ensure destination directory exists
    await ensureDirectoryExists(destination);
    
    // Read all files in source directory
    const files = fs.readdirSync(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
      
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        // Recursively copy subdirectories
        await copyDirectory(sourcePath, destPath);
      } else {
        // Copy file
        fs.copyFileSync(sourcePath, destPath);
      }
    }
    
    console.log(`Copied directory: ${source} -> ${destination}`);
  } catch (error) {
    throw new Error(`Failed to copy directory ${source} to ${destination}: ${error.message}`);
  }
}

async function deleteFileIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
    }
  } catch (error) {
    console.warn(`Warning: Could not delete ${filePath}: ${error.message}`);
  }
}

async function cleanupTempFiles() {
  console.log("Cleaning up temporary files...");
  
  // Clean up PRI config and resource files
  const tempFiles = [
    path.join(PACKAGE_DIR, "priconfig.xml"),
    path.join(PACKAGE_DIR, "resources.pri"),
    path.join(PACKAGE_DIR, "resources.pri.backup")
  ];
  
  for (const file of tempFiles) {
    await deleteFileIfExists(file);
  }
}

async function createPriConfig() {
  console.log("Creating PRI configuration file...");
  
  const configPath = path.join(PACKAGE_DIR, "priconfig.xml");
  const command = `makepri createconfig /cf "${configPath}" /dq en-US /pv 10.0.0`;
  
  try {
    await execSyncWithBuildTools(command, { stdio: 'inherit' });
    console.log("PRI configuration created successfully");
  } catch (error) {
    throw new Error(`Failed to create PRI configuration: ${error.message}`);
  }
}

async function generatePriFile() {
  console.log("Generating PRI file...");
  
  const configPath = path.join(PACKAGE_DIR, "priconfig.xml");
  const command = `makepri new /pr "${PACKAGE_DIR}" /cf "${configPath}" /of "${path.join(PACKAGE_DIR, "resources.pri")}"`;
  
  try {
    await execSyncWithBuildTools(command, { stdio: 'inherit' });
    console.log("PRI file generated successfully");
  } catch (error) {
    throw new Error(`Failed to generate PRI file: ${error.message}`);
  }
}

async function createMsixPackage() {
  console.log("Creating MSIX package...");
  
  const outputPath = path.join(DIST_DIR, "SparseExample.msix");
  const command = `makeappx pack /o /d "${PACKAGE_DIR}" /nv /p "${outputPath}"`;
  
  try {
    await execSyncWithBuildTools(command, { stdio: 'inherit' });
    console.log(`MSIX package created successfully: ${outputPath}`);
  } catch (error) {
    throw new Error(`Failed to create MSIX package: ${error.message}`);
  }
}

async function preparePackage() {
  console.log("=== STEP 1: PREPARING PACKAGE ===");
  
  try {
    // Step 1.1: Ensure directories exist
    console.log("Setting up directory structure...");
    await ensureDirectoryExists(DIST_DIR);
    await ensureDirectoryExists(PACKAGE_DIR);
    
    // Step 1.2: Clean up any existing files first
    console.log("Cleaning up existing files...");
    await cleanupTempFiles();
    
    // Step 1.3: Copy appxmanifest-full.xml as appxmanifest.xml
    console.log("Copying manifest file...");
    const manifestSource = path.join(MSIX_SOURCE_DIR, "appxmanifest-full.xml");
    const manifestDest = path.join(PACKAGE_DIR, "appxmanifest.xml");
    
    if (!fs.existsSync(manifestSource)) {
      throw new Error(`Manifest file not found: ${manifestSource}`);
    }
    
    await copyFile(manifestSource, manifestDest);
    
    // Step 1.4: Copy assets folder
    console.log("Copying assets...");
    if (!fs.existsSync(ASSETS_SOURCE_DIR)) {
      throw new Error(`Assets folder not found: ${ASSETS_SOURCE_DIR}`);
    }
    
    await copyDirectory(ASSETS_SOURCE_DIR, ASSETS_DEST_DIR);

    // Step 1.5: Copy the registration.json file
    console.log("Copying registration.json...");
    const registrationSource = path.join(MSIX_SOURCE_DIR, "registration.json");
    const registrationDest = path.join(PACKAGE_DIR, "registration.json");

    if (!fs.existsSync(registrationSource)) {
      throw new Error(`Registration file not found: ${registrationSource}`);
    }

    await copyFile(registrationSource, registrationDest);

    console.log("Package preparation completed successfully!");
    
  } catch (error) {
    console.error("Error preparing package:", error.message);
    throw error;
  }
}

async function buildPackage() {
  console.log("=== STEP 2: BUILDING MSIX PACKAGE ===");
  
  try {
    // Step 2.1: Create PRI configuration
    await createPriConfig();
    
    // Step 2.2: Generate PRI file
    await generatePriFile();
    
    // Step 2.3: Create MSIX package
    await createMsixPackage();
    
    // Step 2.4: Clean up temporary files
    await cleanupTempFiles();
    
    console.log("MSIX package build completed successfully!");
    
  } catch (error) {
    console.error("Error building package:", error.message);
    throw error;
  }
}

async function main() {
  console.log("Starting MSIX package creation...");
  
  try {
    // Step 1: Prepare the package (clean up and copy files)
    await preparePackage();
    
    console.log("\n" + "=".repeat(50));
    console.log("Preparation complete! Ready for packaging...");
    console.log("=".repeat(50) + "\n");
    
    // Step 2: Build the package (run packaging commands)
    await buildPackage();
    
    console.log("\n" + "=".repeat(50));
    console.log("MSIX package creation completed successfully!");
    console.log(`Output: ${path.join(DIST_DIR, "SparseExample.msix")}`);
    console.log("=".repeat(50));
    
  } catch (error) {
    console.error("Error creating MSIX package:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  // Check if specific step is requested
  const args = process.argv.slice(2);
  
  if (args.includes('--prepare-only') || args.includes('-p')) {
    console.log("Running preparation step only...");
    preparePackage().catch(error => {
      console.error("Preparation failed:", error.message);
      process.exit(1);
    });
  } else if (args.includes('--build-only') || args.includes('-b')) {
    console.log("Running build step only...");
    buildPackage().catch(error => {
      console.error("Build failed:", error.message);
      process.exit(1);
    });
  } else {
    // Run both steps
    main();
  }
}

module.exports = { main, preparePackage, buildPackage };