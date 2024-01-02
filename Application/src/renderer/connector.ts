const { SerialPort } = require('serialport')

class Connector {

    private connectionWindowOpened = false;

    private isConnected = true;

    private receivedData = false;

    private globalPortName = '';

    private globalPort = new SerialPort({
        path: 'COM1',
        baudRate: 115200
    });

    private port = new SerialPort({
        path: 'COM1',
        baudRate: 115200
    });

    private portNames = ['/dev/cu.usbserial-0001', '/dev/cu.usbserial-0002', '/dev/cu.usbserial-210', '/dev/cu.wchusbserial210', 'COM1', 'COM2', 'COM3', 'COM4'];

    private accumulatedData: string = ''

    constructor() {
        this.globalPort.on('close',  () => {
            this.isConnected = false;
        });

        this.globalPort.on('error',  () => {
            this.isConnected = false;
        });
    }

    private parseData(this: any, data: string, portName: string) {
        const regex = /^mroee;S\/N(\d+)/;
        const match = data.match(regex);
        if (match) {
            this.receivedData = true;
            const [, serialNumber] = match;
            console.log(`Найдено соответствие на порту ${portName}: serialNumber = ${serialNumber}`);
            document.getElementById('serialNumber')!.innerHTML = "S/N: " + serialNumber;
        }
    }

    private async connectTo(this: any, portName: string) {
        this.port = new SerialPort({
            path: portName,
            baudRate: 115200
        });

        this.port.write('sendConnect');

        this.port.on('open', () => {
            this.globalPort = this.port;
            this.globalPortName = portName;
            this.isConnected = true; //-----
        });

        return new Promise<void>((resolve, reject) => {
            this.port.on('error', (err: { message: any; }) => {
                this.isConnected = false; //-----
                //console.log(`Ошибка на порту ${portName}: ${err.message}`);
                reject(err);
            });
        });
    }

    private async readData() {
        this.globalPort.on('data', (data: { toString: () => any; }) => {

            const dataStr = data.toString();
            this.accumulatedData += dataStr;
            this.parseData(this.accumulatedData, this.globalPortName);
        });

        this.globalPort.on('close', () => {
            this.isConnected = false;
        });

        return new Promise<void>((resolve, reject) => {
            this.globalPort.on('error', (err: { message: any; }) => {
                this.isConnected = false;
                reject(err);
            });
        });
    }

    public async connect() {
        if (!this.isConnected) {
            for (const portName of this.portNames) {
                try {
                    await this.connectTo(portName);
                } catch (err) {
                    //console.log(err);
                }
            }
        } else {
            if (!this.receivedData) {
                try {
                    await this.readData();
                } catch (err) {
                    //console.log(err);
                }
            } else {
                //await readData();
                this.port.removeAllListeners('error');
                this.port.removeAllListeners('open');
            }
        }

        if (this.isConnected) {
            return true;
        } else {
            return false;
        }
    }

    public connected(){
        return this.isConnected;
    }

    public getGlobalPort(){
        return this.globalPort;
    }
}

export default Connector;