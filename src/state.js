function makeId() {
    return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);
}

const SESSIONS = new Map();

/**
 * The shape of a single session's state.
 * This is what we "remember" across user turns.
 *
 * Fields:
 * - current_url: the page we think we're on
 * - last_results: array of items last extracted from a page
 * - selected_index: which result is currently being inspected by the user
 * - pending_confirmation: if a risky action is waiting for “yes”
 * - history: logs
 * - created_at / updated_at: timestamps for debugging
 */

function newSessionState() {
  return {
    session_id: makeId(),
    current_url: null,
    last_results: [],      
    selected_index: null,  
    pending_confirmation: null, 
    history: [],            
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function createSession() {
  const state = newSessionState();
  SESSIONS.set(state.session_id, state);
  return state;
}

function getSession(sessionId) {
  const s = SESSIONS.get(sessionId);
  if (!s) throw new Error(`Session not found: ${sessionId}`);
  return s;
}

function touch(state) {
  state.updated_at = new Date().toISOString();
}

function setCurrentUrl(sessionId, url) {
  const s = getSession(sessionId);
  s.current_url = url;
  touch(s);
}

function setLastResults(sessionId, rows) {
  const s = getSession(sessionId);
  s.last_results = Array.isArray(rows) ? rows : [];
  touch(s);
}

function setSelectedIndex(sessionId, idx) {
  const s = getSession(sessionId);
  s.selected_index = idx;
  touch(s);
}

function setPendingConfirmation(sessionId, payload) {
  const s = getSession(sessionId);
  // payload example: { action: 'add_to_cart', item: 'Logi M510', price: '$19.99' }
  s.pending_confirmation = payload;
  touch(s);
}

function clearPendingConfirmation(sessionId) {
  const s = getSession(sessionId);
  s.pending_confirmation = null;
  touch(s);
}

function appendHistory(sessionId, entry) {
  const s = getSession(sessionId);
  s.history.push({ ...entry, ts: new Date().toISOString() });
  if (s.history.length > 200) s.history.shift();
  touch(s);
}

/** (Optional) Simple export of current session to a JSON file for debugging. */
const fs = require('node:fs');
function saveSessionSnapshot(sessionId, outPath = `artifacts/${sessionId}-snapshot.json`) {
  const s = getSession(sessionId);
  fs.writeFileSync(outPath, JSON.stringify(s, null, 2), 'utf-8');
  return outPath;
}

module.exports = {
  createSession,
  getSession,
  setCurrentUrl,
  setLastResults,
  setSelectedIndex,
  setPendingConfirmation,
  clearPendingConfirmation,
  appendHistory,
  saveSessionSnapshot,
};
