# Statistik Stadt Zürich: RDF Cube Pipeline

This repository contains the pipeline to convert HDB data as CSV to RDF. As representation, [RDF Cube Schema](https://github.com/zazuko/rdf-cube-schema) is used. 

The pipeline is run in a private Gitlab instance, the result is published on https://ld.stadt-zuerich.ch/sparql/. The SPARQL query endpoint is available at `https://ld.stadt-zuerich.ch/query`

We provide a [.well-known/void](https://ld.stadt-zuerich.ch/.well-known/void) structure that points to relevant metadata.

If you have questions about the pipeline or the data set, create a new issue in this repository.

## Structure

* `input` - Contains static metadata that is read in the pipeline.
* `lib` - Contains custom code used in the RDF production pipeline. 
* `mappings` - Contains all the [XRM](https://github.com/zazuko/expressive-rdf-mapper) mapping files needed to map the data to RDF. This is the single source of truth for the mapping of all the dimensions.
* `observatios` - Contains the mapping for the observations itself. This is the single source of truth for the mapping of the main observation. For historical reasons this is still maintained in a plain JSON file (CSVW standard) instead of XRM. 
* `pipelines` - Contains the [barnard59](https://github.com/zazuko/barnard59) pipelines that run the conversion itself. Barnard59 is a declarative way to run RDF conversion pipelines.
* `scripts` - Contains the shell scripts needed to run the pipeline.
* `sparql` - Contains SPARQL queries that are run in the pipeline.
* `output` - In case the pipeline is run locally, this directory contains the resulting N-Triples file.
* `src-gen` - Generated CSV on the Web mapping files. This folder is generated from the content in the `mappings` directory. Do *not* do any mapping updates in there, it will be overwritten.
* `package.json` - Dependencies & pipeline definitions.


## CSV on the Web

The transformation is based on the CSV on the Web mapping standard by W3C:

* [Model for Tabular Data and Metadata on the Web](https://www.w3.org/TR/tabular-data-model/)
* [Metadata Vocabulary for Tabular Data](https://www.w3.org/TR/tabular-metadata/)
* [CSV on the Web: A Primer](https://www.w3.org/TR/tabular-data-primer/)

Our barnard59 mapping pipeline [provides a module](https://github.com/rdf-ext/rdf-parser-csvw) to process these CSV on the Web mapping files.

## Data Pipeline

The pipeline is run in a CI-Job on GitLab. It is using the standard node.js docker file to execute the RDF pipeline. Details for the configuration and the execution of the scripts can be found in the [Gitlab YAML](.gitlab-ci.yml) file.

### Usage

You can run the pipeline manually given that you have a valid SSH key to get the input data from the sftp server. We also need a unix-like environment like MacOS or Linux and node.js to execute the pipeline. To install all dependencies run `npm install` in the root of this repository.

Once install is finished you can run:

* `npm run fetch` to get the data from the sftp server.
* `npm run output:file` to convert all observations and dimensions.

As a result, a file is written to the `output` directory on your local filesystem.

### Auslösen der Pipeline

Die Pipeline läuft in der GitLab Infrastruktur der Bundes, erreichbar unter [gitlab.ldbar.ch](https://gitlab.ldbar.ch/). Die Pipeline selber wird mit Git versioniert und sowohl auf [Github](https://github.com/StatistikStadtZuerich/ld-data) wie in die Bundes-Instanz von [Gitlab](https://gitlab.ldbar.ch/pipelines/statistik-stadt-zuerich) gepushed.

Die Pipeline besteht immer aus zwei Git Branches:

* `develop`: Entwicklung Umgebung. Sollte für Tests & Bugfixes verwendet werden. Für diese Umgebung wird auf die `integ`-Anlieferung auf dem sftp-Server zugegriffen. Die Daten werden auf die Integrations-Umgebung von LINDAS gespielt, erreichbar unter https://ld.integ.stadt-zuerich.ch/.
* `master`: Produktive Umgebung. Dieser Git-Branch ist geschützt und kann nur über Pull-requests geschrieben werden. Damit soll sichergestellt werden, dass nur getestete Versionen der Pipeline produktiv geschaltet werden.  Für diese Umgebung wird auf die `prod`-Anlieferung auf dem sftp-Server zugegriffen. Die Daten werden auf die Produktions-Umgebung von LINDAS gespielt, erreichbar unter https://ld.stadt-zuerich.ch/.

#### Per Hook

Die Auslösung der Pipeline passiert über sogenannte Gitlab Hooks. Diese können unter anderem die Pipeline ausführen, wie in der [Gitlab-Hilfe dokumentiert](https://docs.gitlab.com/ee/ci/triggers/). Ein Hook ist bei Gitlab ein HTTP POST-Request, welcher über einen Parameter sagt, welcher Branch der Pipeline ausgeführt werden soll.

Die Pipeline kann wie folgt ausgelöst werden:

```bash
curl -X POST \
     -F token=bibop-my-secret-token \
     -F ref=develop \
     https://gitlab.ldbar.ch/api/v4/projects/66/trigger/pipeline
```

In diesem Beispiel würde der `develop`-Brach getriggert. `bibop-my-secret-token`muss durch den entsprechenden Token aus GitLab ersetzt werden. Die Tokens können in *Settings->CI/CD->Pipeline Triggers* erstellt und gelöscht werden. Direkter Link: https://gitlab.ldbar.ch/pipelines/statistik-stadt-zuerich/-/settings/ci_cd.

#### Per Web GUI

Alternativ kann die Pipeline auch durch das CI/CD Menü direkt getriggert werden. Dazu wird in CI/CD->Pipelines oben rechts der Knopf "Run Pipeline" geklickt. Im nächsten Fenster muss ausgewählt werden, welcher Branch ausgeführt werden sollte, siehe Beschreibung der Branches im Intro. Direkter Link: https://gitlab.ldbar.ch/pipelines/statistik-stadt-zuerich/-/pipelines

#### Pipeline Status & Notification

Den Status der Pipeline kann man über das Menü CI/CD einsehen, direkt erreichbar über https://gitlab.ldbar.ch/pipelines/statistik-stadt-zuerich/-/pipelines. Bei erfolgreichem Durchlauf der Pipeline sollte der Status grün sein. Tritt während der Pipeline ein Fehler auf, ändert sich der Status auf Rot & wird als `failed` deklariert.

Bei einem fehlerhaften Durchlauf wird automatisch eine Email an die auf dem Projekt erfassten Personen verschickt. Falls zusätzliche Adressen die Email erhalten sollen, können in *Settings->Integrations->Pipeline status emails* weitere Adressen erfasst werden. Direkter Link: https://gitlab.ldbar.ch/pipelines/statistik-stadt-zuerich/-/settings/integrations/pipelines_email/edit.

#### Fehleranalyse

Im Falle eines Fehlers muss das Log der Pipeline genauer untersucht werden. Daraus sollte ersichtlich sein, welcher Fehler vorliegt. Typische Fehler für die Pipeline:

* Es liegt keine Anlieferung vor auf dem sftp-Server: Nach einer erfolgreichen Transformation wird die letzte Anlieferung in das Verzeichnis `done` der jeweiligen Umgebung verschoben. Sprich ohne neue Anlieferung wird die Pipeline keine Daten mehr vorfinden. Alternativ kann die entsprechende Datei auch aus dem Done-Verzeichnis zurückkopiert werden.
* Die Pipeline hat ein Problem während der Transformation: In diesem Fall muss die Logdatei individuell ausgewertet und interpretiert werden.
* Die Pipeline kann die transformierten Daten nicht hochladen: In diesem Fall scheint ein Problem mit dem LINDAS SPARQL-Endpunkt vorzuliegen. Die Fehlermeldung muss entsprechend interpretiert werden.

### Backup der Daten

Die Daten können via HTTP komplett abgefragt werden. Damit kan jederzeit der volle Datenstamm zur Archivierung abgelegt werden. Die Abfrage läuft über das SPARQL Graph Store Protocol, welches eine einfache HTTP-Abfrage ist.

Die erstellten Views sind einer nicht öffentlich lesbaren Datenbank mit dem Namen `ssz-views` abgelegt. Die eigentlichen Daten sind in einem separaten Graph in der öffentlichen `lindas` Datenbank. 

Mit dem entsprechenden Passwort können die Daten wie folgt in eine Datei geschrieben werden:

`curl -u ssz-views-read:PASSWORD -o views.nq -H "Accept: application/n-quads" https://stardog-int.cluster.ldbar.ch:443/ssz-views`

`curl -u ssz-views-read:PASSWORD -o ssz-data.nt -H "Accept: application/n-triples" "https://stardog-int.cluster.ldbar.ch:443/lindas/?graph=https://lindas.admin.ch/stadtzuerich/stat"`

Die Datei besteht aus N-Triples beziehungsweise N-Quads und kann sehr effektiv komprimiert werden.

Für die PROD-Umgebung ist die URL mit `https://stardog.cluster.ldbar.ch` zu ersetzen.

# License
This program is licensed under [3-Clause BSD License](https://opensource.org/licenses/BSD-3-Clause):
Copyright 2018-2021 Statistik Stadt Zürich

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
