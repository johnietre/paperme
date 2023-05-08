package main

import "encoding/json"

type List[T any] struct {
  head, tail *Node[T]
  len int
}

func NewList[T any]() *List[T] {
  return &List[T]{}
}

func (l *List[T]) Head() *Node[T] {
  return l.head
}

func (l *List[T]) Tail() *Node[T] {
  return l.tail
}

func (l *List[T]) Len() int {
  return l.len
}

func (l *List[T]) IsEmpty() bool {
  return l.len == 0
}

func (l *List[T]) PushBack(value T) *Node[T] {
  if l.tail != nil {
    return l.tail.InsertAfter(value)
  }
  l.len++
  node := &Node[T]{Value: value, list: l}
  l.head, l.tail = node, node
  return node
}

func (l *List[T]) PushFront(value T) *Node[T] {
  if l.head != nil {
    return l.head.InsertBefore(value)
  }
  l.len++
  node := &Node[T]{Value: value, list: l}
  l.head, l.tail = node, node
  return node
}

func (l *List[T]) PopBack() *Node[T] {
  if l.tail == nil {
    return nil
  }
  l.len--
  node := l.tail
  node.Remove()
  return node
}

func (l *List[T]) PopFront() *Node[T] {
  if l.head == nil {
    return nil
  }
  l.len--
  node := l.head
  node.Remove()
  return node
}

func (l *List[T]) Clear() {
  l.head, l.tail, l.len = nil, nil, 0
}

func (l *List[T]) Range(f func(*Node[T]) bool) {
  for n := l.head; n != nil && f(n); n = n.next {
  }
}

func (l *List[T]) MarshalJSON() ([]byte, error) {
  if l.head == nil {
    return []byte("[]"), nil
  }
  b := []byte{'['}
  for n := l.head; n != nil; n = n.next {
    nb, err := json.Marshal(n)
    if err != nil {
      return nil, err
    }
    b = append(b, append(nb, ',')...)
  }
  b[len(b)-1] = ']'
  return b, nil
}

func (l *List[T]) UnmarshalJSON(b []byte) error {
  var arr []T
  if err := json.Unmarshal(b, &arr); err != nil {
    return err
  }
  for _, v := range arr {
    l.PushBack(v)
  }
  return nil
}

type Node[T any] struct {
  Value T
  prev, next *Node[T]
  list *List[T]
}

func (n *Node[T]) Next() *Node[T] {
  return n.next
}

func (n *Node[T]) Prev() *Node[T] {
  return n.prev
}

func (n *Node[T]) List() *List[T] {
  return n.list
}

func (n *Node[T]) InsertAfter(value T) *Node[T] {
  if n.list == nil {
    return nil
  }
  newNode := &Node[T]{Value: value, prev: n, list: n.list}
  if n.next != nil {
    n.next.prev = newNode
    newNode.next = n.next
  } else {
    n.list.tail = newNode
  }
  n.next = newNode
  n.list.len++
  return newNode
}

func (n *Node[T]) InsertBefore(value T) *Node[T] {
  if n.list == nil {
    return nil
  }
  newNode := &Node[T]{Value: value, next: n, list: n.list}
  if n.prev != nil {
    n.prev.next = newNode
    newNode.prev = n.prev
  } else {
    n.list.head = newNode
  }
  n.prev = newNode
  n.list.len++
  return newNode
}

func (n *Node[T]) Remove() {
  if n.list == nil {
    return
  }
  if n == n.list.head {
    if n == n.list.tail {
      n.list.tail = nil
    }
    n.list.head = n.next
  } else if n == n.list.tail {
    n.list.tail = n.prev
  }
  if n.next != nil {
    n.next.prev = n.prev
  }
  if n.prev != nil {
    n.prev.next = n.next
  }
  n.list = nil
  n.list.len--
}

func (n *Node[T]) MarshalJSON() ([]byte, error) {
  return json.Marshal(n.Value)
}

func (n *Node[T]) UnmarshalJSON(b []byte) error {
  return json.Unmarshal(b, &n.Value)
}
