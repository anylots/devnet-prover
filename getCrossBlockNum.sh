#!/bin/bash

base_url="http://127.0.0.1:8545"
start=$1
# start=$((start + 0))

end=$2
# end=$((end + 0))

search_value=$3

# 0x772596f4e1c65b241acf1f8035fd9609ba08b6dd
echo $start

for ((i=start; i<=end; i++));
do
    # Convert block number to hexadecimal
    hex_block=$(printf "0x%x" $i)
    echo $hex_block
    # Construct request data
    data="{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBlockByNumber\",\"params\":[\"$hex_block\", true],\"id\":1}"

    # Use curl to send requests and save responses
    response=$(curl -s -X POST -H "Content-Type: application/json" -d "$data" $base_url)
    # echo $response
    # Check if the response contains a specific address
    if echo $response | grep -q $search_value; then
        # If included, print out the entire block content
        echo "======> Block $hex_block contains the search_value, blockNum = $i"
        # echo $response
    fi
done
