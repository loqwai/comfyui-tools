#!/usr/bin/env fish

# Set default input and output directories
set input_dir ~/Downloads
set output_dir (pwd)

# Parse optional CLI arguments for input and output directories
for i in (seq (count $argv))
    switch $argv[$i]
        case '--in'
            set input_dir $argv[(math $i + 1)]
        case '--out'
            set output_dir $argv[(math $i + 1)]
        case '--help'
            echo "
Usage: script.fish [OPTIONS]

Watches the input directory for new files suffixed with '-comfy.json', processes them, and copies them into the appropriate location based on the existing file structure.

Options:
  --in <input_directory>   Specify the input directory to watch for new files. Defaults to '~/Downloads'.
  --out <output_directory> Specify the output directory for the files. Defaults to the current working directory.
  --help                   Show this help message and exit.
"
            exit 0
    end
end

# Directory where flows are stored
set flow_dir "$output_dir/flows"
# Temporary directory for unmatched files
set tmp_dir "$output_dir/tmp"

# Function to process newly created files
function process_file
    set filepath $argv[1]
    set filename (basename $filepath)
    set base_name (string replace "-comfy.json" "" $filename)
    echo "noticed a new flow: $base_name"
    # Check if a subfolder exists in the flows directory
    if test -d "$flow_dir/$base_name"
        echo "Subfolder for $base_name found, renaming file to flow.json and copying it."
        cp $filepath "$flow_dir/$base_name/flow.json"
    else
        echo "No subfolder found, copying file to $tmp_dir/$base_name.json."
        # Ensure tmp directory exists
        mkdir -p $tmp_dir
        cp $filepath "$tmp_dir/$base_name.json"
    end
end

# Use npx onchange to watch the directory for new files
npx onchange "$input_dir/*-comfy.json" -- echo "hi $1"
