#!/bin/bash
filename=`hexdump -n 16 -v -e '/1 "%02X"' /dev/urandom`
path="${1}/${filename}"
size=524288
remove_consecutive_separator='s/\([,|.]\)\1/\1/g'
# Not yet optimal
LC_CTYPE=C tr -dc [:digit:], < /dev/urandom | head -c $size | sed $remove_consecutive_separator > $path && \
LC_CTYPE=C tr -dc [:alpha:], < /dev/urandom | head -c $size | sed $remove_consecutive_separator >> $path && \
LC_CTYPE=C tr -dc [:alnum:]., < /dev/urandom | head -c $size | sed $remove_consecutive_separator >> $path && \
# Real num??
#awk -v n=10 -v seed="$RANDOM" 'BEGIN { srand(seed); for (i=0; i<n; ++i) printf("​%.4f\n", rand()) }'
LC_CTYPE=C tr -dc [:digit:], < /dev/urandom | head -c $size | sed $remove_consecutive_separator >> $path && \
echo $filename
