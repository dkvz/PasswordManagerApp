
export function postLogin(sessionId, password, dataFile) {
  return new Promise((resolve, reject) => {
    fetch('/api/v1/login', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        password,
        dataFile
      })
    })
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
            reject('Your session has expired');
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