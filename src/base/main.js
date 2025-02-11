import storage from 'storage/storage';

function main() {
  // Script may be injected multiple times.
  if (self.baseModule) {
    return;
  } else {
    self.baseModule = true;
  }

  async function checkTask() {
    if (document.readyState !== 'complete') {
      document.addEventListener('readystatechange', checkTask, {once: true});
      return;
    }

    const {taskRegistry} = await storage.get('taskRegistry');
    if (Date.now() - taskRegistry.lastTaskStart < 600000) {
      await browser.runtime.sendMessage({id: 'taskRequest'});
    }
  }

  if (window.top === window) {
    checkTask();
  }
}

main();
