#!/bin/bash

# Run truffle compile
echo "Compiling contracts..."
truffle compile

# Copy contract files to src/contract folder
echo "Copying contract files..."
cp -r build/contracts/* src/contracts/

# Run truffle migrate with --reset option
echo "Deploying contracts..."
truffle migrate --reset

echo "Deployment completed."
