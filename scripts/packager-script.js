require('shelljs/global');

echo('Shell script : Packager App');
echo(" ");

// require electron-packer
echo(" ");
echo('Checks if required module(s) is/are present ');
if (!which('electron-packager')) {
    echo('Sorry, this script requires electron-packager');
    exit(1);
}


// tests if previously folder exists
if (test('-d', 'client_for_package')) {

    // remove previously packaged app
    echo(" ");
    echo("Remove previously packaged app ");
    rm('-rf', 'client_for_package');

    if (error()) {
        echo(" ");
        echo("can't remove current client_for_package folder");
        exit(1);
    }

}

// create folder for packaged app
echo(" ");
echo("Create folder for packaged app");
mkdir('-p', 'client_for_package/src/client');

if (error()) {
    echo(" ");
    echo("can't create client_for_package folder");
    exit(1);
}

// copy files for packaged app
echo(" ");
echo("Copy files for packaged app");
cp('-R', 'src/client', 'client_for_package/src/client');

// check
if ( error() ) {
    echo(" ");
    echo("can't copy src/client folder");
    exit(1);
}

// get a list of another required files
let anotherFile = [ "app.js", "events.js" , "properties.json" ,  "properties-loader.js"];

// copy another files for packaged app

anotherFile.forEach( function(element) {

    cp("src/" + element, "client_for_package/src/" + element);

    // check
    if ( error() ) {
        echo(" ");
        echo("can't copy client/src/" + element + "file");
        exit(1);
    }
});

// copy package.json
echo(" ");
echo("Copy package.json");
cp("package.json", "client_for_package/");

if ( error() ) {
    echo("can't copy package.json file");
    exit(1);
}

// go to client_for_package folder
echo(" ");
cd('client_for_package/');
echo("Running install --production");

if (exec('npm install --production').code !== 0) {
    echo("can't npm install --production");
    exit(1);
}

echo(" ");
echo("Running electron-packager");

// Run external tool synchronously
if (exec('electron-packager . P4ng --platform=win32 --arch=x64').code !== 0) {
    echo('Error: electron-packager failed');
    exit(1);
}

echo(" ");
echo("JOB COMPLETED : Enjoy our P4ng game");
echo("You can find the executable inside : " + pwd() + "\\P4ng-win32-x64" );


exit(0);