package main

import "sync"

type SyncMap[K, V any] struct {
  m sync.Map
}

func NewSyncMap[K, V any]() *SyncMap[K, V] {
  return &SyncMap[K, V]{}
}

func (m *SyncMap[K, V]) Load(k K) (v V, loaded bool) {
  if val, ok := m.m.Load(k); ok {
    v, loaded = val.(V), true
  }
  return
}

func (m *SyncMap[K, V]) Store(k K, v V) {
  m.m.Store(k, v)
}

func (m *SyncMap[K, V]) LoadOrStore(k K, v V) (vv V, loaded bool) {
  val, ok := m.m.LoadOrStore(k, v)
  return val.(V), ok
}

func (m *SyncMap[K, V]) LoadAndDelete(k K) (v V, loaded bool) {
  if val, ok := m.m.LoadAndDelete(k); ok {
    v, loaded = val.(V), true
  }
  return
}
