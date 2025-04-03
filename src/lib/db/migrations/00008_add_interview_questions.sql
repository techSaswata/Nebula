-- Insert sample questions into interview_questions table
INSERT INTO interview_questions (question, approach, type, solution, category, topic) VALUES
(
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  'Use a hash map to store the complement of each number as we iterate through the array. For each number, check if its complement exists in the hash map.',
  'algorithm',
  'function twoSum(nums: number[], target: number): number[] {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) {
        return [map.get(complement), i];
      }
      map.set(nums[i], i);
    }
    return [];
  }',
  'Arrays & Hashing',
  'Two Sum'
),
(
  'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
  'Use recursive approach with min and max bounds for each node. Each node''s value must be within the valid range based on its position in the tree.',
  'data_structure',
  'function isValidBST(root: TreeNode | null): boolean {
    function validate(node: TreeNode | null, min: number, max: number): boolean {
      if (!node) return true;
      if (node.val <= min || node.val >= max) return false;
      return validate(node.left, min, node.val) && validate(node.right, node.val, max);
    }
    return validate(root, -Infinity, Infinity);
  }',
  'Trees',
  'Validate Binary Search Tree'
),
(
  'Implement a function to reverse a linked list.',
  'Use three pointers (prev, current, next) to iterate through the list and reverse the links.',
  'data_structure',
  'function reverseList(head: ListNode | null): ListNode | null {
    let prev = null;
    let current = head;
    while (current !== null) {
      const next = current.next;
      current.next = prev;
      prev = current;
      current = next;
    }
    return prev;
  }',
  'Linked Lists',
  'Reverse Linked List'
),
(
  'Given a string s, find the length of the longest substring without repeating characters.',
  'Use sliding window technique with a hash map to track character positions.',
  'algorithm',
  'function lengthOfLongestSubstring(s: string): number {
    const map = new Map();
    let maxLength = 0;
    let start = 0;
    
    for (let end = 0; end < s.length; end++) {
      if (map.has(s[end])) {
        start = Math.max(start, map.get(s[end]) + 1);
      }
      map.set(s[end], end);
      maxLength = Math.max(maxLength, end - start + 1);
    }
    
    return maxLength;
  }',
  'Sliding Window',
  'Longest Substring Without Repeating Characters'
); 