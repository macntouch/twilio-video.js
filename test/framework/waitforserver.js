'use strict';

const http = require('http');

/**
 * This function returns a Promise that resolves once the specified HTTP server
 * responds to an OPTIONS request. The OPTIONS request will be retried until
 * a configurable timeout occurs, at which point the Promise rejects.
 * @param {string} host - the HTTP server host
 * @param {number} port - the HTTP server port
 * @param {number} [timeout=30000] - timeout in ms
 * @returns {Promise<undefined>}
 */
function waitForServer(host, port, timeout) {
  timeout = timeout || 30000;

  return new Promise((resolve, reject) => {
    let timedout = false;

    function sendOptionsRequest() {
      return new Promise((resolve, reject) => {
        http.request({
          host: host,
          port: port,
          method: 'OPTIONS'
        }, resolve).on('error', reject).end();
      }).then(() => {
        clearTimeout(timer);
        resolve();
      }, () => {
        if (!timedout) {
          return sendOptionsRequest();
        }
      });
    }

    const timer = setTimeout(() => {
      timedout = true;
      reject(new Error(`Timeout of ${timeout} exceeded`));
    }, timeout);

    sendOptionsRequest();
  });
}

module.exports = waitForServer;
