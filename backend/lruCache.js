class Node {
  constructor(key, value, expiryMs = 6 * 60 * 60 * 1000) {
    this.key = key;
    this.value = value;
    this.expiry = Date.now() + expiryMs;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();

    // Dummy head and tail nodes to avoid edge cases
    this.head = new Node(null, null);
    this.tail = new Node(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key) {
    if (!this.map.has(key)) return null;

    const node = this.map.get(key);

    // Check if expired
    if (Date.now() > node.expiry) {
      this._remove(node);
      this.map.delete(key);
      return null;
    }

    // Move to front (most recently used)
    this._remove(node);
    this._insertAtFront(node);
    return node.value;
  }

  put(key, value, expiryMs = undefined) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key));
    }

    const node = new Node(key, value, expiryMs);
    this._insertAtFront(node);
    this.map.set(key, node);

    // Evict least recently used if over capacity
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _insertAtFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
}

module.exports = LRUCache;
