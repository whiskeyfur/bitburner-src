/* eslint-disable @typescript-eslint/no-var-requires */
const { app, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs/promises");

const log = require("electron-log");
const flatten = require("lodash/flatten");
const Store = require("electron-store");
const { isBinaryFormat } = require("./saveDataBinaryFormat");
const store = new Store();
const { steamworksClient } = require("./steamworksUtils");

// https://stackoverflow.com/a/69418940
const dirSize = async (directory) => {
  const files = await fs.readdir(directory);
  const stats = files.map((file) => fs.stat(path.join(directory, file)));
  return (await Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);
};

const getDirFileStats = async (directory) => {
  const files = await fs.readdir(directory);
  const stats = files.map((f) => {
    const file = path.join(directory, f);
    return fs.stat(file).then((stat) => ({ file, stat }));
  });
  const data = await Promise.all(stats);
  return data;
};

const getNewestFile = async (directory) => {
  const data = await getDirFileStats(directory);
  return data.sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())[0];
};

const getAllSaves = async (window) => {
  const rootDirectory = getSaveFolder(window, true);
  const data = await fs.readdir(rootDirectory, { withFileTypes: true });
  const savesPromises = data
    .filter((e) => e.isDirectory())
    .map((dir) => path.join(rootDirectory, dir.name))
    .map((dir) => getDirFileStats(dir));
  const saves = await Promise.all(savesPromises);
  const flat = flatten(saves);
  return flat;
};

async function prepareSaveFolders(window) {
  const rootFolder = getSaveFolder(window, true);
  const currentFolder = getSaveFolder(window);
  const backupsFolder = path.join(rootFolder, "/_backups");
  await prepareFolders(rootFolder, currentFolder, backupsFolder);
}

async function prepareFolders(...folders) {
  for (const folder of folders) {
    try {
      // Making sure the folder exists
      await fs.stat(folder);
    } catch (error) {
      if (error.code === "ENOENT") {
        log.warn(`'${folder}' not found, creating it...`);
        await fs.mkdir(folder);
      } else {
        log.error(error);
      }
    }
  }
}

async function getFolderSizeInBytes(saveFolder) {
  try {
    return await dirSize(saveFolder);
  } catch (error) {
    log.error(error);
  }
}

function setAutosaveConfig(value) {
  store.set("autosave-enabled", value);
}

function isAutosaveEnabled() {
  return store.get("autosave-enabled", true);
}

function setCloudEnabledConfig(value) {
  store.set("cloud-enabled", value);
}

function getSaveFolder(window, root = false) {
  if (root) {
    return path.join(app.getPath("userData"), "/saves");
  }
  const identifier = window.gameInfo?.player?.identifier ?? "";
  return path.join(app.getPath("userData"), "/saves", `/${identifier}`);
}

function isCloudEnabled() {
  // If the Steam API could not be initialized on game start, we'll abort this.
  if (!steamworksClient) {
    return false;
  }

  // If the user disables it in Steam there's nothing we can do
  if (!steamworksClient.cloud.isEnabledForAccount()) {
    return false;
  }

  // Let's check the config file to see if it's been overridden
  if (!store.get("cloud-enabled", true)) {
    return false;
  }

  if (!steamworksClient.cloud.isEnabledForApp()) {
    steamworksClient.cloud.setEnabledForApp(true);
  }

  return true;
}

function saveCloudFile(name, content) {
  steamworksClient.cloud.writeFile(name, content);
}

function getFilenameOfFirstCloudFile() {
  const files = steamworksClient.cloud.listFiles();
  if (files.length === 0) {
    throw new Error("No files in cloud");
  }
  const file = files[0];
  log.silly(`Found ${files.length} files.`);
  log.silly(`First File: ${file.name} (${file.size} bytes)`);
  return file.name;
}

function getCloudFile() {
  return steamworksClient.cloud.readFile(getFilenameOfFirstCloudFile());
}

function deleteCloudFile() {
  return steamworksClient.cloud.deleteFile(getFilenameOfFirstCloudFile());
}

async function backupSteamDataToDisk(currentPlayerId) {
  const files = steamworksClient.cloud.listFiles();
  if (files.length === 0) {
    return;
  }

  const file = files[0];
  const previousPlayerId = file.name.replace(".json.gz", "");
  if (previousPlayerId !== currentPlayerId) {
    const backupSaveData = await getSteamCloudSaveData();
    const backupFile = path.join(app.getPath("userData"), "/saves/_backups", `${previousPlayerId}.json.gz`);
    await fs.writeFile(backupFile, backupSaveData, "utf8");
    log.debug(`Saved backup game to '${backupFile}`);
  }
}

/**
 * The name of save file is `${currentPlayerId}.json.gz`. The content of save file is weird: it's a base64 string of the
 * binary data of compressed json save string. It's weird because the extension is .json.gz while the content is a
 * base64 string. Check the comments in the implementation to see why it is like that.
 */
async function pushSaveDataToSteamCloud(saveData, currentPlayerId) {
  if (!isCloudEnabled()) {
    return Promise.reject("Steam Cloud is not Enabled");
  }

  try {
    await backupSteamDataToDisk(currentPlayerId);
  } catch (error) {
    log.error(error);
  }

  const steamSaveName = `${currentPlayerId}.json.gz`;

  /**
   * When we push save file to Steam Cloud, we use steamworksClient.cloud.writeFile. This function requires a string as
   * the file content. That is why saveData is encoded in base64 and pushed to Steam Cloud as a text file.
   *
   * Encoding saveData in UTF-8 (with buffer.toString("utf8")) is not the proper way to convert binary data to string.
   * Quote from buffer's documentation: "If encoding is 'utf8' and a byte sequence in the input is not valid UTF-8, then
   * each invalid byte is replaced with the replacement character U+FFFD.". The proper way to do it is to use
   * String.fromCharCode or String.fromCodePoint.
   *
   * Instead of implementing it, the old code (encoding in base64) is used here for backward compatibility.
   */
  const content = Buffer.from(saveData).toString("base64");
  log.debug(`saveData: ${saveData.length} bytes`);
  log.debug(`Base64 string of saveData: ${content.length} bytes`);
  log.debug(`Saving to Steam Cloud as ${steamSaveName}`);

  try {
    saveCloudFile(steamSaveName, content);
  } catch (error) {
    log.error(error);
  }
}

/**
 * This function processes the save file in Steam Cloud and returns the save data in the binary format.
 */
async function getSteamCloudSaveData() {
  if (!isCloudEnabled()) {
    return Promise.reject("Steam Cloud is not Enabled");
  }
  log.debug(`Fetching Save in Steam Cloud`);
  const cloudString = getCloudFile();
  // Decode cloudString to get save data back.
  const saveData = Buffer.from(cloudString, "base64");
  log.debug(`SaveData: ${saveData.length} bytes`);
  return saveData;
}

async function saveGameToDisk(window, electronGameData) {
  const currentFolder = getSaveFolder(window);
  let saveFolderSizeBytes = await getFolderSizeInBytes(currentFolder);
  const maxFolderSizeBytes = store.get("autosave-quota", 1e8); // 100Mb per playerIndentifier
  const remainingSpaceBytes = maxFolderSizeBytes - saveFolderSizeBytes;
  log.debug(`Folder Usage: ${saveFolderSizeBytes} bytes`);
  log.debug(`Folder Capacity: ${maxFolderSizeBytes} bytes`);
  log.debug(
    `Remaining: ${remainingSpaceBytes} bytes (${((saveFolderSizeBytes / maxFolderSizeBytes) * 100).toFixed(2)}% used)`,
  );
  let saveData = electronGameData.save;
  const file = path.join(currentFolder, electronGameData.fileName);
  try {
    await fs.writeFile(file, saveData, "utf8");
    log.debug(`Saved Game to '${file}'`);
    log.debug(`Save Size: ${saveData.length} bytes`);
  } catch (error) {
    log.error(error);
  }

  const fileStats = await getDirFileStats(currentFolder);
  const oldestFiles = fileStats
    .sort((a, b) => a.stat.mtime.getTime() - b.stat.mtime.getTime())
    .map((f) => f.file)
    .filter((f) => f !== file);

  while (saveFolderSizeBytes > maxFolderSizeBytes && oldestFiles.length > 0) {
    const fileToRemove = oldestFiles.shift();
    log.debug(`Over Quota -> Removing "${fileToRemove}"`);
    try {
      await fs.unlink(fileToRemove);
    } catch (error) {
      log.error(error);
    }

    saveFolderSizeBytes = await getFolderSizeInBytes(currentFolder);
    log.debug(`Save Folder: ${saveFolderSizeBytes} bytes`);
    log.debug(
      `Remaining: ${maxFolderSizeBytes - saveFolderSizeBytes} bytes (${(
        (saveFolderSizeBytes / maxFolderSizeBytes) *
        100
      ).toFixed(2)}% used)`,
    );
  }

  return file;
}

async function loadLastFromDisk(window) {
  const folder = getSaveFolder(window);
  const last = await getNewestFile(folder);
  log.debug(`Last modified file: "${last.file}" (${last.stat.mtime.toLocaleString()})`);
  return loadFileFromDisk(last.file);
}

async function loadFileFromDisk(path) {
  const buffer = await fs.readFile(path);
  let content;
  if (isBinaryFormat(buffer)) {
    // Save file is in the binary format.
    content = buffer;
  } else {
    // Save file is in the base64 format.
    content = buffer.toString("utf8");
  }
  log.debug(`Loaded file with ${content.length} bytes`);
  return content;
}

function getSaveInformation(window, save) {
  return new Promise((resolve) => {
    ipcMain.once("get-save-info-response", (event, data) => {
      resolve(data);
    });
    window.webContents.send("get-save-info-request", save);
  });
}

function getCurrentSave(window) {
  return new Promise((resolve) => {
    ipcMain.once("get-save-data-response", (event, data) => {
      resolve(data);
    });
    window.webContents.send("get-save-data-request");
  });
}

function pushSaveGameForImport(window, save, automatic) {
  ipcMain.once("push-import-result", (event, arg) => {
    log.debug(`Was save imported? ${arg.wasImported ? "Yes" : "No"}`);
  });
  window.webContents.send("push-save-request", { save, automatic });
}

async function restoreIfNewerExists(window) {
  const currentSave = await getCurrentSave(window);
  const currentData = await getSaveInformation(window, currentSave.save);
  const steam = {};
  const disk = {};

  try {
    steam.save = await getSteamCloudSaveData();
    steam.data = await getSaveInformation(window, steam.save);
  } catch (error) {
    log.error("Could not retrieve steam file");
    log.debug(error);
  }

  try {
    const saves = (await getAllSaves()).sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());
    if (saves.length > 0) {
      disk.save = await loadFileFromDisk(saves[0].file);
      disk.data = await getSaveInformation(window, disk.save);
    }
  } catch (error) {
    log.error("Could not retrieve disk file");
    log.debug(error);
  }

  const lowPlaytime = 1000 * 60 * 15;
  let bestMatch;
  if (!steam.data && !disk.data) {
    log.info("No data to import");
  } else if (!steam.data) {
    // We'll just compare using the lastSave field for now.
    log.debug("Best potential save match: Disk");
    bestMatch = disk;
  } else if (!disk.data) {
    log.debug("Best potential save match: Steam Cloud");
    bestMatch = steam;
  } else if (steam.data.lastSave >= disk.data.lastSave || steam.data.playtime + lowPlaytime > disk.data.playtime) {
    // We want to prioritze steam data if the playtime is very close
    log.debug("Best potential save match: Steam Cloud");
    bestMatch = steam;
  } else {
    log.debug("Best potential save match: disk");
    bestMatch = disk;
  }
  if (bestMatch) {
    if (bestMatch.data.lastSave > currentData.lastSave + 5000) {
      // We add a few seconds to the currentSave's lastSave to prioritize it
      log.info("Found newer data than the current's save file");
      log.silly(bestMatch.data);
      pushSaveGameForImport(window, bestMatch.save, true);
      return true;
    } else if (bestMatch.data.playtime > currentData.playtime && currentData.playtime < lowPlaytime) {
      log.info("Found older save, but with more playtime, and current less than 15 mins played");
      log.silly(bestMatch.data);
      pushSaveGameForImport(window, bestMatch.save, true);
      return true;
    } else {
      log.debug("Current save data is the freshest");
      return false;
    }
  }
}

module.exports = {
  getCurrentSave,
  getSaveInformation,
  restoreIfNewerExists,
  pushSaveGameForImport,
  pushSaveDataToSteamCloud,
  getSteamCloudSaveData,
  deleteCloudFile,
  saveGameToDisk,
  loadLastFromDisk,
  loadFileFromDisk,
  getSaveFolder,
  prepareSaveFolders,
  getAllSaves,
  isCloudEnabled,
  setCloudEnabledConfig,
  isAutosaveEnabled,
  setAutosaveConfig,
};
