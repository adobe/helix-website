#!/bin/sh

## do the following to set up the list of patch files

# OLDBRANCH=$1
# NEWBRANCH=$2

# git checkout $OLDBRANCH
# git format-patch main
# git checkout main
# git checkout -b $NEWBRANCH
# git checkout $NEWBRANCH

## you will now have a directory of files called 0001-your-commit-message.patch
## that you could, under normal circumstances just apply using `git am`. But
## we need to change the patch path from tools/rum to tools/oversight so we do
## that with `sed`

for patch in 0*-*.patch; do
  cat $patch | sed -e "s|tools/rum/|tools/oversight/|g" | git am --3way && rm $patch
done

## If any of these patches fails, the script will abort and leave your working copy
## in a slightly dirty stage. The right way to get out of this is to:
## fix the merge conflict in your favorite editor
# git add tools/oversight/conflicted.js    # tell git that the conflict has been resolved
# git am --continue                        # reuse the original commit message, author, etc
# rm 0003-the-patch-that-failed.patch      # remove the patch file, so that we don't try this again next
# sh patches.sh                            # apply remaining patches, hope for fewer conflicts

## The wrong way to get out of this, but that will still leave you with a clean working copy is
# rm 0*-*.patch                            # remove all patch files
# git am --abort                           # forget about this whole `git am` thing