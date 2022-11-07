#!/usr/bin/env bash
set -u
echo "Working in environment: $SFTPENV"
echo "df /upload/$SFTPENV/HDB_Full.zip" | sftp -b - statistikstadtzuerich@sftp.zazukoians.org
if [ $? -eq 0 ]
then
    set -eo pipefail
    echo "File HDB_Full.zip exists, running main pipeline..."
    npm run fetch
    unzip input/HDB_Full.zip -d input # should be part of pipeline
    npm run output:file
    npm run file:store
    curl -u $GRAPHSTORE_USERNAME:$GRAPHSTORE_PASSWORD  --data-urlencode "query@sparql/shape-filter.rq" $ENDPOINT/update
    #./scripts/ssz-views.sh
    #echo "rename /upload/$SFTPENV/HDB_Full.zip /upload/$SFTPENV/done/HDB_Full.zip" | sftp -b - statistikstadtzuerich@sftp.zazukoians.org
    set +eo pipefail
else
    echo "File HDB_Full.zip does not exist, checking for diff delivery..."

    echo "df /upload/$SFTPENV/HDB_Diff.zip" | sftp -b - statistikstadtzuerich@sftp.zazukoians.org
    if [ $? -eq 0 ]
    then
      set -eo pipefail
      echo "File HDB_Diff.zip exists, running diff pipeline"
      npm run fetchDiff
      npm run output:dimensions:store
      npm run output:observations:store
      curl -u $GRAPHSTORE_USERNAME:$GRAPHSTORE_PASSWORD  --data-urlencode "query@sparql/diff-delivery-update-active-graph.rq" $ENDPOINT/update
      ./scripts/ssz-views.sh
      echo "rename /upload/$SFTPENV/HDB_Diff.zip /upload/$SFTPENV/done/HDB_Diff.zip" | sftp -b - statistikstadtzuerich@sftp.zazukoians.org
      set +eo pipefail
    else
      echo "File HDB_Diff.zip does not exist either, aborting..."
      exit 1
    fi
fi



