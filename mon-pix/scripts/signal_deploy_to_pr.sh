#!/bin/bash

[ -z $GITHUB_USER ] && {
	echo 'FATAL: $GITHUB_USER is absent'
	exit 1
}

[ -z $GITHUB_USER_TOKEN ] && {
	echo 'FATAL: $GITHUB_USER_TOKEN is absent'
	exit 1
}
[ -z $CIRCLE_BRANCH ] && {
	echo 'FATAL: $CIRCLE_BRANCH is absent'
	exit 1
}
[ -z $CI_PULL_REQUEST ] && {
	echo 'INFO: $CI_PULL_REQUEST is absent. I will not post a message to github. Bye !'
	exit 0
}

PR_NUMBER=`echo $CI_PULL_REQUEST | grep -Po '(?<=pix/pull/)(\d+)'`
REVIEW_APP_URL="https://pix-mon-pix-integration-pr$PR_NUMBER.scalingo.io"

curl -u $GITHUB_USER:$GITHUB_USER_TOKEN --verbose \
	-X POST "https://api.github.com/repos/1024pix/pix/issues/${PR_NUMBER}/comments" \
	--data "{\"body\":\"I'm deploying this PR to $REVIEW_APP_URL . Please check it out\"}"
