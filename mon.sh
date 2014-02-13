#! /bin/bash
echo "starting literate-programming"
literate-programming lp_marked.md
echo "testing"
node v8/test.js
echo "done"

# use with nodemon -e md --exec mon.sh