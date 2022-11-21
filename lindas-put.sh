#!/bin/sh
ENDPOINT=${ENDPOINT:=https://stardog-int.cluster.ldbar.ch/lindas}
echo "Posting to endpoint: $ENDPOINT"
curl -n \
     -X PUT \
     --http1.1 \
     -H Content-Type:application/n-triples \
     -T output/output.nt \
     -G $ENDPOINT \
     --data-urlencode graph=https://lindas.admin.ch/stadtzuerich/stat
