Algorithm description:

Algorithm uses n-gram to highlight reviews(https://en.wikipedia.org/wiki/N-gram).

Steps:
1. For every review in review list:
    1.1. Lowercase.
    1.2. Removed punctuation and context dependent words.
    1.3. For every word in review:
        1.3.1. Get ngram and increase value in dictionary
2. Merge ngram dictionary to common dictionary.
3. Sort dictionary based on count.
4. Set index to 0
5. While result length is less then n:
    5.1 Push all reviews from index element of ngrams array
        and mark then as highlighted.
    5.2 If result length is less then n push ngram itself
    5.3. Increment index
    
How to run:

    git clone https://github.com/IvanKozlov95/highlight_review
    cd highlight_review
    ./rh 'path_to_review_file' 'number_of_highlights'
