#!/bin/bash

if [ -n "$SENTRY_RELEASE" ]; then
  curl -sL https://sentry.io/get-cli/ | SENTRY_CLI_VERSION="2.6.0" bash
  sentry-cli login --auth-token ${SENTRY_AUTH_TOKEN}
  sentry-cli releases new -p $SENTRY_PROJECT $CODEBUILD_RESOLVED_SOURCE_VERSION
  sentry-cli releases files $CODEBUILD_RESOLVED_SOURCE_VERSION upload-sourcemaps dist/frontend/browser/
  sentry-cli releases finalize $CODEBUILD_RESOLVED_SOURCE_VERSION
  sentry-cli releases deploys $CODEBUILD_RESOLVED_SOURCE_VERSION new -e $SENTRY_ENVIRONMENT
fi
