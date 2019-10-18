var os = require('os')
let cpus = os.cpus();

exports.handler = async (event) => {

    const specJson = require('./spec.json');
    const { execSync } = require('child_process');
    let response = {};

    response['CPUs'] = cpus
    response['NumOfCPUs'] = cpus.length
    Object.keys(specJson).forEach(function (value) {
        try {
            // process.stdout.write(execSync(specJson[value]))
            response[value] = execSync(specJson[value]).toString().replace(/\t/g, '').split('\n');
        }
        catch (error) {
            response[value] = error.toString();
        }
    });

    return response;
};
