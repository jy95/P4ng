#!/usr/bin/env bash
mkdir ../client_for_package 2> /dev/null

if ! ( ( rm -r ../client_for_package && mkdir -p ../client_for_package/src/client ) ); then
    echo "can't reset current client_for_package folder."
    exit 1
fi

if ! cp -r ../src/client ../client_for_package/src/client; then
    echo "can't copy src/client folder."
    exit 1
fi

list="app.js events.js properties.json properties-loader.js"

for fn in $list; do
    if ! cp "../src/$fn" "../client_for_package/src/$fn"; then
        echo "can't copy client/src/$fn file."
        exit 1
    fi
done

if ! cp  ../package.json ../client_for_package/; then
    echo "can't copy P4ng/package.json file."
    exit 1
fi

if ! ( ( cd ../client_for_package/ && npm install --production ) ); then
    echo "can't npm install."
    exit 1
fi

if ! electron-packager . P4ng --platform=win32 --arch=x64; then
    echo "can't generate package."
fi