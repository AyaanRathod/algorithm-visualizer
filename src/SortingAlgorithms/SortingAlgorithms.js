// Merge Sort implementation in JavaScript

/**
 * Merge Sort is a divide and conquer algorithm.
 * It divides the input array into two halves, recursively sorts them, 
 * and then merges the sorted halves to produce a sorted output.
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

export const mergeSort = (arr) => {
    // Base case: arrays with 0 or 1 elements are already sorted
    if (arr.length <= 1) {
        return arr;
    }

    // Divide the array into two halves
    const middle = Math.floor(arr.length / 2);
    const leftArr = arr.slice(0, middle);
    const rightArr = arr.slice(middle);

    // Recursively sort both halves
    const sortedLeft = mergeSort(leftArr);
    const sortedRight = mergeSort(rightArr);
    // Hint: This is where the "divide" part happens

    // Merge the sorted halves
    return merge(mergeSort(leftArr), mergeSort(rightArr));
}

/**
 * Merges two sorted arrays into one sorted array
 * @param {Array} leftArr - The left sorted array
 * @param {Array} rightArr - The right sorted array
 * @returns {Array} - The merged sorted array
 */
function merge(leftArr, rightArr) {
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    // Compare elements from both arrays and add the smaller one to result
    // add the smaller one to result and increment its index

    while (leftIndex < leftArr.length && rightIndex < rightArr.length) {
        if (leftArr[leftIndex] < rightArr[rightIndex]) {
            result.push(leftArr[leftIndex]);
            leftIndex++;
        } else {
            result.push(rightArr[rightIndex]);
            rightIndex++;
        }
    }

    
    
    // If there are any remaining elements in leftArr, add them
    while (leftIndex < leftArr.length) {
        result.push(leftArr[leftIndex]);
        leftIndex++;
    }

    // If there are any remaining elements in rightArr, add them
    while (rightIndex < rightArr.length) {
        result.push(rightArr[rightIndex]);
        rightIndex++;
    }

    return result;
}

// Export the function to use in other files
export default mergeSort;