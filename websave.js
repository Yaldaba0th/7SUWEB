document.getElementById('downloadSave').addEventListener('click', downloadIndexedDBData);

async function downloadIndexedDBData() {
  const dbName = '/easyrpg/Save';
  const storeName = 'FILE_DATA';
  const gameName = '7SU'; // Game abbreviation

  // Get the current date and time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); 
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  // Filename
  const filename = `${gameName}-${year}-${month}-${day}-${hour}-${minutes}.json`;


  // Open Index DB
  const request = indexedDB.open(dbName);
  request.onsuccess = async function (event) {
    const db = event.target.result;
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    // Get store data
    const dataRequest = store.getAll();
    dataRequest.onsuccess = function () {
      const allKeysRequest = store.getAllKeys();
      allKeysRequest.onsuccess = function () {
        const keys = allKeysRequest.result;
        const values = dataRequest.result;

        // Get keys and values dict
        const data = keys.map((key, index) => ({
          key: key,
          value: values[index]
        }));

        // Convert data to JSON
        const jsonData = JSON.stringify(data);

        // Create a JSON Blob
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create a link element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Kill object
        URL.revokeObjectURL(url);
      };
      allKeysRequest.onerror = function () {
        console.error('Failed to retrieve keys from IndexedDB.');
      };
    };
    dataRequest.onerror = function () {
      console.error('Failed to retrieve data from IndexedDB.');
    };
  };
  request.onerror = function () {
    console.error('Failed to open IndexedDB.');
  };
}



document.getElementById('uploadSave').addEventListener('click', function () {
  alert("Haven't got this working yet. Sorry =(");
  // document.getElementById('uploadFile').click();
});

document.getElementById('uploadFile').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    uploadIndexedDBData(file);
  }
});

async function uploadIndexedDBData(file) {
  const dbName = '/easyrpg/Save';
  const storeName = 'FILE_DATA';

  // Read the JSON file
  const reader = new FileReader();
  reader.onload = async function (event) {
    const jsonData = event.target.result;
    let data;

    try {
      data = JSON.parse(jsonData);
    } catch (e) {
      console.error('Failed to parse JSON.');
      return;
    }

    // Open IndexedDB
    const request = indexedDB.open(dbName);
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Add or update each entry in the store
      data.forEach(item => {
        const { key, value } = item;
        store.put(value, key);
      });

      transaction.oncomplete = function () {
        console.log('Data successfully imported into IndexedDB.');
      };

      transaction.onerror = function () {
        console.error('Failed to import data into IndexedDB.');
      };

      db.close();
      console.log('DB Closed.');
    };
    request.onerror = function () {
      console.error('Failed to open IndexedDB.');
    };

  };
  reader.readAsText(file);
}
