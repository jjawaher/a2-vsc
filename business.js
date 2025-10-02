
const persistence = require('./persistence');

/**
 * Login using plaintext username/password (assignment requirement).
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{id:number,username:string}|undefined>} user or undefined
 */
async function login(username, password) {
  const user = await persistence.getUserByUsername(username);
  if (user && user.password === password) {
    return { id: user.id, username: user.username };
  }
  return undefined;
}

/**
 * Get a photo if the logged-in user owns it.
 * @param {number} userId
 * @param {number} photoId
 * @returns {Promise<object|{error:string}>}
 */
async function getOwnedPhoto(userId, photoId) {
  const p = await persistence.getPhotoById(photoId);
  if (!p) return { error: 'Photo not found' };
  if (p.owner !== userId) return { error: 'Access denied (not your photo)' };
  return p;
}

/**
 * Update title/description if user owns the photo.
 * @param {number} userId
 * @param {number} photoId
 * @param {string} title
 * @param {string} description
 * @returns {Promise<{ok:boolean,error?:string}>}
 */
async function updatePhotoDetails(userId, photoId, title, description) {
  const p = await persistence.getPhotoById(photoId);
  if (!p) return { ok: false, error: 'Photo not found' };
  if (p.owner !== userId) return { ok: false, error: 'Access denied (not your photo)' };
  const ok = await persistence.updatePhotoById(photoId, title, description);
  return { ok };
}

/**
 * Add a tag if user owns the photo (prevents duplicates at the business layer).
 * @param {number} userId
 * @param {number} photoId
 * @param {string} tag
 * @returns {Promise<{ok:boolean,error?:string,skipped?:boolean}>}
 */
async function addTag(userId, photoId, tag) {
  const p = await persistence.getPhotoById(photoId);
  if (!p) return { ok: false, error: 'Photo not found' };
  if (p.owner !== userId) return { ok: false, error: 'Access denied (not your photo)' };
  const t = String(tag).toLowerCase();
  if (p.tags.includes(t)) {
    return { ok: true, skipped: true };
  }
  const ok = await persistence.addTagToPhoto(photoId, t);
  return { ok };
}

/**
 * Resolve album by name, then return only the logged-in user's photos in that album.
 * @param {number} userId
 * @param {string} albumName
 * @returns {Promise<{album?:object, photos?:Array, error?:string}>}
 */
async function getUserPhotosInAlbum(userId, albumName) {
  const album = await persistence.getAlbumByName(albumName);
  if (!album) return { error: 'Album not found' };
  const all = await persistence.listPhotosInAlbum(album.id);
  const mine = all.filter(p => p.owner === userId);
  return { album, photos: mine };
}

/**
 * Convert album id array to album name array (helper for display mapping).
 * @param {Array<number>} albumIdList
 * @returns {Promise<Array<string>>}
 */
async function mapAlbumIdsToNames(albumIdList) {
  const names = [];
  for (const aid of albumIdList) {
    const a = await persistence.getAlbumById(aid);
    if (a) names.push(a.name);
  }
  return names;
}

module.exports = {
  login,
  getOwnedPhoto,
  updatePhotoDetails,
  addTag,
  getUserPhotosInAlbum,
  mapAlbumIdsToNames
};
