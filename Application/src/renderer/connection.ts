const windowOperations = require('./windowOperations');

const { SerialPort } = require('serialport')

let connectionWindowOpened = false;
let isConnected = true;
let receivedData = false;
let globalPortName = '';
export let globalPort = new SerialPort({
  path: 'COM1',
  baudRate: 115200
});
let port = new SerialPort({
  path: 'COM1',
  baudRate: 115200
});
const portNames = ['/dev/cu.usbserial-0001', '/dev/cu.usbserial-0002', 'COM1', 'COM2', 'COM3', 'COM4'];


let accumulatedData: string = ''

function parseData(data: string, portName: string) {
  const regex = /^mroee;S\/N(\d+)/;
  const match = data.match(regex);
  if (match) {
    receivedData = true;
    const [, serialNumber] = match;
    console.log(`Найдено соответствие на порту ${portName}: serialNumber = ${serialNumber}`);
    document.getElementById('serialNumber')!.innerHTML = "S/N: " + serialNumber;
  }
}

async function connectTo(portName: string) {
  port = new SerialPort({
    path: portName,
    baudRate: 115200
  });

  port.write('sendConnect');

  port.on('open', () => {
    globalPort = port;
    globalPortName = portName;
    isConnected = true; //-----
  });

  return new Promise<void>((resolve, reject) => {
    port.on('error', (err: { message: any; }) => {
      isConnected = false; //-----
      //console.log(`Ошибка на порту ${portName}: ${err.message}`);
      reject(err);
    });
  });
}

async function readData() {
  globalPort.on('data', (data: { toString: () => any; }) => {

    const dataStr = data.toString();
    accumulatedData += dataStr;
    parseData(accumulatedData, globalPortName);
  });

  globalPort.on('close', function () {
    isConnected = false;
  });

  return new Promise<void>((resolve, reject) => {
    globalPort.on('error', (err: { message: any; }) => {
      isConnected = false; //-----
      //console.log(`Ошибка на порту ${globalPortName}: ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  //console.log("Port opened: " + globalPort.isOpen + " Connected: " + isConnected);

  if (isConnected) {
    windowOperations.closeModalWindow('connection');
    document.getElementById("disconnectedMessage")?.classList.add("hidden");
    document.getElementById("connectionIcon")!.style.backgroundImage = "url(resources/icons/connected.png)";
    document.getElementById("preview")?.classList.remove("blurredPreview");
    connectionWindowOpened = false;
  } else {
    /*if(!connectionWindowOpened){
      showModalWindow('connection');
      document.getElementById("disconnectedMessage")?.classList.remove("hidden");
      document.getElementById("connectionIcon")!.style.backgroundImage = "url(resources/icons/disconnected.png)";
      document.getElementById("preview")?.classList.add("blurredPreview");
      connectionWindowOpened = true;
    }*/
  }

  if (!isConnected) {
    for (const portName of portNames) {
      try {
        await connectTo(portName);
      } catch (err) {
        //console.log(err);
      }
    }
  } else {
    if (!receivedData) {
      try {
        await readData();
      } catch (err) {
        //console.log(err);
      }
    } else {
      //await readData();
      port.removeAllListeners('error');
      port.removeAllListeners('open');
    }
  }
}

globalPort.on('close', function () {
  isConnected = false;
});

globalPort.on('error', function () {
  isConnected = false;
});

setInterval(() => main(), 1500);