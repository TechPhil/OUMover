const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const { auth } = require('google-auth-library');
const { exit } = require('process');

const prompt = require('prompt-sync')({sigint: true});

const SCOPES = ['https://www.googleapis.com/auth/admin.directory.device.chromeos', 'https://www.googleapis.com/auth/admin.directory.orgunit']
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const CONFIG_PATH = path.join(process.cwd(),'config.json');
const config = require(CONFIG_PATH);


async function authorize() {
    console.log('Attempting authorization...');
    console.log('Check your web browser to authorize OUMover (this may take a while)')
    try {
        client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        return client;
    } catch (err) {
        console.error('Unable to authenticate. Make sure that credentials.json is set up correctly!', err.message);
        exit()
    }
    
}

async function fetchDevices(service,ouName,pageToken=null) {
    if(pageToken == null) {
        const res = await service.chromeosdevices.list({
            customerId: 'my_customer',
            orgUnitPath: ouName
        })
        return res;
    } else {
        const res = await service.chromeosdevices.list({
            customerId: 'my_customer',
            orgUnitPath: ouName,
            pageToken: pageToken
        })
        return res;
    }
    
}

async function compileDevices(service, ouName) {
    let goAgain = true;
    let fullDeviceList = [];
    let pageToken = null;
    while(goAgain) {
        let res = await fetchDevices(service, ouName,pageToken);
        if (res.data.chromeosdevices == undefined) {
            return []
        }
        fullDeviceList = fullDeviceList.concat(res.data.chromeosdevices);
        if (!res.data.nextPageToken) {
            goAgain = false;
        } else {
            pageToken = res.data.nextPageToken
        }
    }
    return fullDeviceList;
}

async function listDevices(service,ouName) {
    let devices = await compileDevices(service, ouName)

    if (!devices || devices.length === 0 || devices === [undefined]) {
        console.log('No devices found');
        return [];
    }

    console.log(`${devices.length} devices found:`);
    return devices;
}


async function bulkMove(service, destOU, deviceList) {
    let deviceIDs = []
    deviceList.forEach(async (device) => {
        console.log(`Moving ${device.serialNumber} (${device.annotatedLocation})`)
        deviceIDs.push(device.deviceId);
        if (deviceIDs.length == 50) {
            await service.chromeosdevices.moveDevicesToOu({
                customerId: 'my_customer',
                orgUnitPath: destOU,
                requestBody: {
                    "deviceIds": deviceIDs
                }
            })
            deviceIDs = []
        }
    })
    if (deviceIDs.length > 0) {
        await service.chromeosdevices.moveDevicesToOu({
            customerId: 'my_customer',
            orgUnitPath: destOU,
            requestBody: {
                "deviceIds": deviceIDs
            }
        })
    }
}

async function MoveOU(auth, sourceOU, destOU) {
    const service = google.admin({version: 'directory_v1', auth});
    console.log(`Moving ${sourceOU} to ${destOU}`);
    let devices = await listDevices(service, sourceOU);
    if (devices == []) return;
    await bulkMove(service, destOU, devices);
}


async function beginMoves(auth, config) {
    for (const move of config) {
        await MoveOU(auth, move[0], move[1])
    }
}


async function _main() {
    const auth = await authorize();
    console.log(`Available Configurations: ${Object.keys(config).filter(cn => {return cn!='sample'})}`)
    const configName = prompt('Authorized! Please enter a configuration. > ')
    if(!config[configName]) {
        console.log('Invalid config!');
        exit()
    }
    console.log(`Config ${configName} will complete the following moves - `)
    config[configName].forEach((move) => {
        console.log(`${move[0]} => ${move[1]}`);
    })
    if(prompt('OK to continue? y/n > ') == 'y') {
        await beginMoves(auth,config[configName]);
    } else {
        exit();
    }
}


module.exports = async function() {
    try {
        await _main()
        prompt('Complete!');
    } catch (err) {
        console.error(err);
    }
};