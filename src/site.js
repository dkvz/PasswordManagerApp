import './css/site.css';
import aes from './aes';
import { postLogin } from './api';

//console.log(aes.randomBytes(16));

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  // We're on the login page:
  const state = {
    sequence: []
  };

  const seqBtns = document.querySelectorAll('.sequence-grid button');
  const slides = document.querySelectorAll('.slides-container > section');
  const masterPwd = document.getElementById('masterPassword');
  const dataFile = document.getElementById('dataFile');
  const sessionIdInput = document.getElementById('sessionId');
  state.sessionId = sessionIdInput ? sessionIdInput.value : '';

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
    reset();
    const seqStr = state.sequence.join(';');
    console.log('Current sequence: ' + seqStr);
    console.log('Session ID: ' + state.sessionId);
    // We need to SHA1 the sequence, and then SHA1(SHA1(seq) + sessionId)
    // And we need to keep (SHA1(seq) + sessionId) because it's needed to
    // decrypt what the server sends.
    aes.hash(seqStr)
      .then(seqHash => {
        state.key = seqHash + state.sessionId;
        aes.hash(state.key)
          .then(sessionHash => {
            console.log('Session hash is: ' + sessionHash);
            // Request actual login from API:
            postLogin(
              sessionHash,
              aes.encrypt(masterPwd.value, state.key),
              dataFile.selectedIndex
            )
            .then(() => console.log('Login success!'))
            .catch(() => console.log('Login error'));
          });
      });
  });

  document.getElementById('resetBtn').addEventListener('click', reset);
}