import './css/site.css';
import aes from './aes';
import { postLogin } from './api';
import { base64ToUint8Array } from './b64Uint8ArrayConversions';
import Toaster from './toaster';

function showSuccessSlide(slides) {
  // We're expecting there to be just two of them even 
  // though the system is primed for more if needed.
  slides[0].className = 'past';
  slides[1].className = 'present';
}

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  // We're on the login page:
  const state = {
    sequence: []
  };

  // Setup the toaster:
  const notification = document.getElementById('notification');
  state.toaster = new Toaster(notification);

  const seqBtns = document.querySelectorAll('.sequence-grid button');
  const slides = document.querySelectorAll('.slides-container > section');
  const masterPwd = document.getElementById('masterPassword');
  const dataFile = document.getElementById('dataFile');
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

  const reset = () => {
    state.sequence = [];
    masterPwd.value = '';
  };

  for (let i = 0; i < seqBtns.length; i++) {
    seqBtns[i].addEventListener('click', seqInputEvent);
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
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
            // Request actual login from API:
            aes.encrypt(masterPwd.value, state.key)
              .then(encryptedPwd => {
                postLogin(
                  sessionHash,
                  encryptedPwd,
                  dataFile.selectedIndex
                )
                .then(showSuccessSlide(slides))
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

  document.getElementById('resetBtn').addEventListener('click', reset);
}