DIR := $(shell dirname $(lastword $(MAKEFILE_LIST)))

ifndef SERVER
  SERVER=server-not-set
endif

HOST := stats.foldingathome.org
DEST := $(SERVER):/var/www/$(HOST)

all: build

node_modules:
	npm install

build: node_modules
	npm run build

publish:
	rsync -rv --delete --exclude config.js dist/ $(DEST)/html/

publish-config:
	rsync -v deploy/config.js $(DEST)/html/config.js

publish-nginx:
	rsync -v deploy/nginx.conf $(SERVER):/etc/nginx/sites-available/$(HOST)

clean:
	rm -rf dist

.PHONY: all build publish publish-config publish-nginx clean
