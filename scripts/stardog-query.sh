#!/bin/sh
stardog query ssz-staging sparql/qb-slicelock.rq
stardog query ssz-staging sparql/dataset-topic.rq
stardog query ssz-staging sparql/view-shape-dimensions.rq
stardog query ssz-staging sparql/sliceKey-shape.rq
stardog query ssz-staging sparql/qb-slices-code.rq
stardog query ssz-staging sparql/delete-undefined.rq
stardog query ssz-staging sparql/delete-xxx-object.rq
stardog query ssz-staging sparql/delete-xxx-predicate.rq