#!/bin/sh
if [ -z ${CI_COMMIT_TAG} ];
then
    # unset
    echo "Getting $1 from integ"
    curl -k -s -n --proxy ld.stadt-zuerich.ch:56948 https://ssz-webdav.integ.stadt-zuerich.ch/HDB_Dropzone/${1} -o input/${1}
else
    echo "Getting $1 from prod"
    curl -k -s -n https://www.ssz-webdav.stadt-zuerich.ch/HDB_Dropzone/${1} -o input/${1}
fi