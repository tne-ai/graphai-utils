##
## Base Commands
## -------------
# https://www.gnu.org/software/make/manual/make.html#Flavors
# Use simple expansion for most and not ?= since default is /bin/bash
# which is bash v3 for MacOS
SHELL := /usr/bin/env bash
# the URL of the org like tne.ai

.DEFAULT_GOAL := help

# https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html does not
# https://swcarpentry.github.io/make-novice/08-self-doc/ is simpler just need
## help: available commands (the default)
.PHONY: help
help: $(MAKEFILE_LIST)
	@sed -n 's/^##//p' $(MAKEFILE_LIST)

## install: install dependencies
.PHONY: install
install:
	brew install typescript
	yarn install
	yarn build

## run: Start OpenAI Compatible API server
.PHONY: run
run:
	@echo "Starting OpenAI Compatible API server...using OPENAI_API_KEY"
	cd packages/express && yarn run server

## test: test OpenAI Compatible API server
.PHONY: test
test:
	# cd packages/express && node --test -r tsconfig/register --require ts-node/register ./test/run_openai.ts
	cd packages/express && node --test -r tsconfig-paths/register --require ts-node/register ./test/run_openai.ts
