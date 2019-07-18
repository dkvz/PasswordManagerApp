import './css/site.css';
import aes from './aes';
import {
  postLogin,
  postLogout,
  getNames,
  getEntry
} from './api';
import { base64ToUint8Array } from './b64Uint8ArrayConversions';
import Toaster from './toaster';
import {
  showSuccessSlide,
  setLoading,
  removeNodesFromElement,
  addHtmlOption
} from './ui';

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  // We're on the login page:
  const state = {
    sequence: []
  };

  // Put up loading screen while initializing:
  const loading = document.getElementById('loading');
  setLoading(loading, true);

  // Setup the toaster:
  const notification = document.getElementById('notification');
  state.toaster = new Toaster(notification);

  const seqBtns = document.querySelectorAll('.sequence-grid button');
  const slides = document.querySelectorAll('.slides-container > section');
  const masterPwd = document.getElementById('masterPassword');
  const dataFile = document.getElementById('dataFile');
  const nameSelect = document.getElementById('nameSelect');
  const selectEntryForm = document.getElementById('selectEntryForm');
  const entryDate = document.getElementById('entryDate');
  const nameInput = document.getElementById('nameInput');
  const passwordInput = document.getElementById('passwordInput');
  const sessionIdInput = document.getElementById('sessionId');
  state.sessionId = sessionIdInput ? sessionIdInput.value : '';


  // Cheap debug tactic
  //showSuccessSlide(slides);


  const seqInputEvent = (e) => {
    // Button is in e.currentTarget
    state.sequence.push(
      e.currentTarget.getAttribute('data-x') + ',' +
      e.currentTarget.getAttribute('data-y')
    );
  };

  const getSelectedEntry = () => {
    // Don't forget to set the loading status somewhere.
    // Actually it's so fast that I won't for now.
    state.toaster.close();
    if (nameSelect.selectedIndex !== undefined) {
      const entryId = nameSelect.options[nameSelect.selectedIndex].value;
      getEntry(state.sessionHash, entryId)
        .then(data => {
          // We need to decrypt the password:
          if (data && data.password) {
            aes.decrypt(data.password, state.key)
              .then(pwd => {
                nameInput.value = data.name;
                entryDate.textContent = 
                  `Last modified: ${data.parsedDate.toLocaleDateString()}`;
                passwordInput.value = pwd;
              })
              .catch(err => {
                state.toaster.error(`Could not decrypt data from server`);
                console.log(err);
              });
          } else state.toaster.error(`Server sent malformed data`);
        })
        .catch(err => {
          state.toaster.error(`Error loading data for the entry: ${err}`);
        })
    }

  };

  const refreshNames = () => {
    return new Promise((resolve) => {
      getNames(state.sessionHash)
        .then(data => {
          removeNodesFromElement(nameSelect);
          state.names = data.map((n, i) => ({ name: n, index: i + 1 }))
            .sort(
              (a, b) =>
                a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
            );
          state.names.forEach(
            (e) =>
              addHtmlOption(
                nameSelect,
                e.name,
                document,
                e.index,
                { type: 'dblclick', callback: getSelectedEntry }
              )
          );
          resolve(true);
        })
        .catch(err => {
          state.toaster.error(`Error loading the entries: ${err}`);
          resolve(false);
        });
    });
  };

  const reset = () => {
    state.sequence = [];
    masterPwd.value = '';
    setLoading(loading, false);
  };

  for (let i = 0; i < seqBtns.length; i++) {
    seqBtns[i].addEventListener('click', seqInputEvent);
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.toaster.close();
    setLoading(loading, true);
    const seqStr = state.sequence.join(';');
    // Convert sessionId to bytes:
    state.sessionIdBytes = base64ToUint8Array(state.sessionId);
    // We need to SHA1 the sequence, and then SHA1(SHA1(seq) + sessionId)
    // And we need to keep (SHA1(seq) + sessionId) because it's needed to
    // decrypt what the server sends.
    aes.hashStringToBytes(seqStr)
      .then(seqHashBytes => {
        //state.key = seqHash + state.sessionId;
        // Concat the byte arrays into one:
        state.key = new Uint8Array(seqHashBytes.length + state.sessionIdBytes.length);
        state.key.set(seqHashBytes);
        state.key.set(state.sessionIdBytes, seqHashBytes.length);
        aes.hashBytesToString(state.key)
          .then(sessionHash => {
            state.sessionHash = sessionHash;
            // Request actual login from API:
            aes.encrypt(masterPwd.value, state.key)
              .then(encryptedPwd => {
                postLogin(
                  sessionHash,
                  encryptedPwd,
                  dataFile.selectedIndex
                )
                  .then(() => {
                    // Get the entry names:
                    refreshNames().then(() => {
                      setLoading(loading, false);
                      document.title = document.title.replace('Login', 'CONNECTED');
                      showSuccessSlide(slides);
                    });
                  })
                  .catch((err) => {
                    state.toaster.error(`Login error: ${err}`);
                    reset();
                  });
              })
              .catch(err => {
                state.toaster.error(`Encryption error: ${err}`);
                reset();
              });
          });
      });
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    state.toaster.close();
    reset();
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (state.sessionHash) {
      postLogout(state.sessionHash)
        .then(resp => {
          console.log(resp);
          window.location.reload();
        });
    }
  });

  selectEntryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    getSelectedEntry();
  });

  setLoading(loading, false);

}