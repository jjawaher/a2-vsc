
const fs = require('fs/promises');

const PHOTO_FILE = 'photos.json';
const USER_FILE = 'users.json';
const ALBUM_FILE = 'albums.json';

/**
 * Read and parse a JSON file.
 * @param {string} path path to JSON file
 * @returns {Promise<any>} parsed JSON
 */
async function readJson(path) {
  const raw = await fs.readFile(path, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Stringify and write JSON to file.
 * @param {string} path path to JSON file
 * @param {any} data data to write
 * @returns {Promise<void>}
 */
async function writeJson(path, data) {
  const txt = JSON.stringify(data, null, 2);
  await fs.writeFile(path, txt, 'utf-8');
}

/**
 * Get one user by username.
 * @param {string} username
 * @returns {Promise<object|undefined>}
 */
async function getUserByUsername(username) {
  const users = await readJson(USER_FILE);
  return users.find(u => u.username === username);
}

/**
 * Get all albums.
 * @returns {Promise<Array>}
 */
async function getAllAlbums() {
  return readJson(ALBUM_FILE);
}

/**
 * Get album by id.
 * @param {number} albumId
 * @returns {Promise<object|undefined>}
 */
async function getAlbumById(albumId) {
  const albums = await getAllAlbums();
  return albums.find(a => a.id === albumId);
}

/**
 * Get album by name (case-insensitive).
 * @param {string} name
 * @returns {Promise<object|undefined>}
 */
async function getAlbumByName(name) {
  const albums = await getAllAlbums();
  const n = name.toLowerCase();
  return albums.find(a => a.name.toLowerCase() === n);
}

/**
 * Get all photos.
 * @returns {Promise<Array>}
 */
async function getAllPhotos() {
  return readJson(PHOTO_FILE);
}

/**
 * Get a single photo by id.
 * @param {number} photoId
 * @returns {Promise<object|undefined>}
 */
async function getPhotoById(photoId) {
  const photos = await getAllPhotos();
  return photos.find(p => p.id === photoId);
}

/**
 * Persist a full photo list back to disk.
 * @param {Array} photoList
 * @returns {Promise<void>}
 */
async function saveAllPhotos(photoList) {
  await writeJson(PHOTO_FILE, photoList);
}

/**
 * Update a photo's title and description (by id).
 * @param {number} photoId
 * @param {string} title
 * @param {string} description
 * @returns {Promise<boolean>} true if updated
 */
async function updatePhotoById(photoId, title, description) {
  const photos = await getAllPhotos();
  let updated = false;
  for (const p of photos) {
    if (p.id === photoId) {
      p.title = title;
      p.description = description;
      updated = true;
      break;
    }
  }
  if (updated) await saveAllPhotos(photos);
  return updated;
}

/**
 * Add a tag to a photo (no duplicate filtering).
 * @param {number} photoId
 * @param {string} tag lowercased tag
 * @returns {Promise<boolean>} true if updated
 */
async function addTagToPhoto(photoId, tag) {
  const photos = await getAllPhotos();
  let updated = false;
  for (const p of photos) {
    if (p.id === photoId) {
      p.tags.push(tag);
      updated = true;
      break;
    }
  }
  if (updated) await saveAllPhotos(photos);
  return updated;
}

/**
 * List photos in an album by albumId.
 * @param {number} albumId
 * @returns {Promise<Array>} photos in that album
 */
async function listPhotosInAlbum(albumId) {
  const photos = await getAllPhotos();
  return photos.filter(p => Array.isArray(p.albums) && p.albums.includes(albumId));
}

module.exports = {
  getUserByUsername,
  getAllAlbums,
  getAlbumById,
  getAlbumByName,
  getAllPhotos,
  getPhotoById,
  saveAllPhotos,
  updatePhotoById,
  addTagToPhoto,
  listPhotosInAlbum
};
