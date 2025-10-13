#!/bin/bash
# Converts Markdown literal prompts into plain text for AI use

input_dir="prompts/literal/01_start/"
output_dir="prompts/literal_txt"

mkdir -p "$output_dir"

for file in "$input_dir"/*.md; do
  filename=$(basename "$file" .md)
  sed 's/\*\*//g; s/#//g' "$file" > "$output_dir/$filename.txt"
done

echo "✅ Converted all literal prompts to plain text in $output_dir"