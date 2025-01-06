#! /bin/bash

DEPENDENCY="@adobe/rum-distiller"
VERSION_FROM_PACKAGE_JSON=$(node -e "console.log(require('./package.json').devDependencies['@adobe/rum-distiller'])")

# find all import maps in the project, and replace the import named $1 with the value of $2

find ./tools/oversight ./tools/rum -name "*.html" | while read file; do
  echo "Processing $file upgrading $DEPENDENCY to $VERSION_FROM_PACKAGE_JSON"
  # Use sed to replace the import map entry with the new version
  sed -i.bak "s|\"@adobe/rum-distiller\": \"https://esm.sh/@adobe/rum-distiller@[0-9.]*\"|\"@adobe/rum-distiller\": \"https://esm.sh/@adobe/rum-distiller@$VERSION_FROM_PACKAGE_JSON\"|g" "$file"
  rm "$file.bak"
done