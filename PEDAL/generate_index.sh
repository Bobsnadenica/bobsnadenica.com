#!/bin/bash
set -e

ROOT_DIR="pedali"
OUTPUT_FILE="$ROOT_DIR/index.json"

echo "🔍 Scanning $ROOT_DIR ..."

# Start JSON
echo '{ "folders": {' > "$OUTPUT_FILE"

first_region=true
for region in "$ROOT_DIR"/*; do
  [ -d "$region" ] || continue
  region_name=$(basename "$region")

  if [ "$first_region" = true ]; then
    first_region=false
  else
    echo ',' >> "$OUTPUT_FILE"
  fi

  echo -n "  \"$region_name\": {" >> "$OUTPUT_FILE"

  first_folder=true
  for folder in "$region"/*; do
    [ -d "$folder" ] || continue
    folder_name=$(basename "$folder")

    if [ "$first_folder" = true ]; then
      first_folder=false
    else
      echo ',' >> "$OUTPUT_FILE"
    fi

    echo -n "    \"$folder_name\": [" >> "$OUTPUT_FILE"

    first_file=true
    for file in "$folder"/*; do
      [ -f "$file" ] || continue
      file_name=$(basename "$file")

      if [ "$first_file" = true ]; then
        first_file=false
      else
        echo -n ',' >> "$OUTPUT_FILE"
      fi

      echo -n "\"$file_name\"" >> "$OUTPUT_FILE"
    done

    echo -n "]" >> "$OUTPUT_FILE"
  done

  echo -n "}" >> "$OUTPUT_FILE"
done

# End JSON
echo ' } }' >> "$OUTPUT_FILE"

echo "✅ Generated $OUTPUT_FILE successfully."