const { ipcRenderer } = require('electron');

const removeClass = (id, class_name) => {
  const el = document.getElementById(id);
  if (el.classList.contains(class_name)) {
    el.classList.remove(class_name);
  }
};
const addClass = (id, class_name) => {
  const el = document.getElementById(id);
  if (!el.classList.contains(class_name)) {
    el.classList.add(class_name);
  }
};

const startLoadData = () => {
  document.getElementById('run-command').disabled = true;
  removeClass('run-command-spinner', 'd-none');
};

const finishLoadData = () => {
  document.getElementById('run-command').disabled = false;
  addClass('run-command-spinner', 'd-none');
  removeClass('alert-message', 'd-none');
};

const closeAlert = (e) => {
  addClass('alert-message', 'd-none');
};

document.getElementById('run-command').addEventListener('click', async () => {
  const reqBaseUrl = document.getElementById('reqBaseUrl').value;
  const reqId = document.getElementById('reqId').value;
  const reqCount = document.getElementById('reqCount').value;
  startLoadData();
  ipcRenderer.send('asynchronous-message', {
    url: reqBaseUrl,
    id: reqId,
    count: reqCount,
  });
});

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  const { tot_count, count } = arg;
  console.log(arg);
  document.getElementById(
    'result-message'
  ).innerHTML = `Total : ${tot_count}, success: ${count}`;
  finishLoadData();
  setTimeout(closeAlert, 3000);
});

// main(43093098, 20);
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reqBaseUrl').value =
    'https://nextdoors.ml/process.php?business_id=';
  document.getElementById('reqId').value = '43093098';
  document.getElementById('reqCount').value = '20';
  document
    .getElementById('alert-message')
    .addEventListener('click', closeAlert);
});
