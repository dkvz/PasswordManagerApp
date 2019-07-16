
function createApiRequest(body) {
  return {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

export function postLogin(sessionId, password, dataFile) {
  return new Promise((resolve, reject) => {
    fetch('/api/v1/login', createApiRequest({ sessionId, password, dataFile }))
    .then((resp) => { 
      // I think I'm going to respond with JSON.
      // Should probably check the response status here.
      if (resp.status >= 200 && resp.status < 300) {
        resolve();
      } else {
        switch(resp.status) {
          case 400:
            reject('Invalid arguments');
            break;
          case 401:
            reject('Session validation failed. Sequence code is wrong or your session has expired.');
            break;
          case 403:
            reject('Invalid password or data file');
            break;
          default:
            reject(`Server error, status ${resp.status}`);
        }
      }
    })
    .catch(() => reject('Network error'));
  });
}

export function postLogout(sessionId) {
  return new Promise((resolve) => {
    fetch('/api/v1/logout', createApiRequest({ sessionId }))
    .then((resp) => {
      // We always expect this to work.
      resolve(resp);
    })
    .catch((err) => resolve(err));
  });
}

export function getNames(sessionId) {
  return new Promise((resolve, reject) => {
    fetch('/api/v1/names', createApiRequest({ sessionId }))
    .then((resp) => {
      if (resp.status >= 200 && resp.status < 300) {
        resp.json().then(resolve);
      } else {
        switch(resp.status) {
          case 403:
            reject('Unauthorized access');
            break;
          default:
            reject(`Server error, status ${resp.status}`);
        }
      }
    })
    .catch(reject);
  });
}