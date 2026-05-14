import { describe, it, expect, beforeEach } from 'vitest'
import { TodoStore } from './store'

describe('TodoStore', () => {
  let store: TodoStore

  beforeEach(() => {
    store = new TodoStore()
  })

  // ─── add ───────────────────────────────────────────

  describe('add', () => {
    it('should add a todo and return it with correct properties', () => {
      const todo = store.add({ title: 'Buy milk' })

      expect(todo.id).toBe(1)
      expect(todo.title).toBe('Buy milk')
      expect(todo.completed).toBe(false)
      expect(todo.createdAt).toBeInstanceOf(Date)
    })

    it('should auto-increment id for each new todo', () => {
      const t1 = store.add({ title: 'First' })
      const t2 = store.add({ title: 'Second' })

      expect(t1.id).toBe(1)
      expect(t2.id).toBe(2)
    })

    it('should trim whitespace from title', () => {
      const todo = store.add({ title: '  Buy milk  ' })

      expect(todo.title).toBe('Buy milk')
    })

    it('should throw on empty title', () => {
      expect(() => store.add({ title: '' })).toThrow('Todo title cannot be empty')
    })

    it('should throw on whitespace-only title', () => {
      expect(() => store.add({ title: '   ' })).toThrow('Todo title cannot be empty')
    })
  })

  // ─── getAll ────────────────────────────────────────

  describe('getAll', () => {
    it('should return empty array when no todos', () => {
      expect(store.getAll()).toEqual([])
    })

    it('should return all added todos', () => {
      store.add({ title: 'A' })
      store.add({ title: 'B' })

      expect(store.getAll()).toHaveLength(2)
    })

    it('should return a copy (not the internal array)', () => {
      store.add({ title: 'A' })

      const list = store.getAll()
      list.push({ id: 999, title: 'Hacked', completed: false, createdAt: new Date() })

      expect(store.getAll()).toHaveLength(1)
    })
  })

  // ─── getById ───────────────────────────────────────

  describe('getById', () => {
    it('should return the todo with matching id', () => {
      store.add({ title: 'A' })
      const t2 = store.add({ title: 'B' })

      expect(store.getById(2)?.title).toBe(t2.title)
    })

    it('should return undefined for non-existent id', () => {
      expect(store.getById(999)).toBeUndefined()
    })
  })

  // ─── update ────────────────────────────────────────

  describe('update', () => {
    it('should update the title', () => {
      store.add({ title: 'Old title' })

      const updated = store.update(1, { title: 'New title' })

      expect(updated.title).toBe('New title')
    })

    it('should mark as completed', () => {
      store.add({ title: 'Task' })

      const updated = store.update(1, { completed: true })

      expect(updated.completed).toBe(true)
    })

    it('should trim updated title', () => {
      store.add({ title: 'Task' })

      const updated = store.update(1, { title: '  Trimmed  ' })

      expect(updated.title).toBe('Trimmed')
    })

    it('should throw on non-existent id', () => {
      expect(() => store.update(999, { title: 'X' })).toThrow('Todo with id 999 not found')
    })

    it('should throw on empty title update', () => {
      store.add({ title: 'Task' })

      expect(() => store.update(1, { title: '' })).toThrow('Todo title cannot be empty')
    })
  })

  // ─── remove ────────────────────────────────────────

  describe('remove', () => {
    it('should remove existing todo and return true', () => {
      store.add({ title: 'To remove' })

      expect(store.remove(1)).toBe(true)
      expect(store.getAll()).toHaveLength(0)
    })

    it('should return false for non-existent id', () => {
      expect(store.remove(999)).toBe(false)
    })
  })

  // ─── search ────────────────────────────────────────

  describe('search', () => {
    beforeEach(() => {
      store.add({ title: 'Buy milk' })
      store.add({ title: 'Buy eggs' })
      store.add({ title: 'Learn TypeScript' })
      store.add({ title: 'Write tests' })
      store.update(1, { completed: true })
      store.update(4, { completed: true })
    })

    it('should find todos matching keyword', () => {
      const results = store.search('buy')

      expect(results).toHaveLength(2)
      expect(results.map((t) => t.title)).toEqual(['Buy milk', 'Buy eggs'])
    })

    it('should be case-insensitive', () => {
      const results = store.search('MILK')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Buy milk')
    })

    it('should return all todos for empty keyword', () => {
      const results = store.search('')

      expect(results).toHaveLength(4)
    })

    it('should return empty array when no match', () => {
      const results = store.search('nonexistent')

      expect(results).toHaveLength(0)
    })

    it('should filter by completed status', () => {
      const completed = store.search('', true)
      const pending = store.search('', false)

      expect(completed).toHaveLength(2)
      expect(completed.map((t) => t.title)).toEqual(['Buy milk', 'Write tests'])

      expect(pending).toHaveLength(2)
      expect(pending.map((t) => t.title)).toEqual(['Buy eggs', 'Learn TypeScript'])
    })

    it('should combine keyword and status filter', () => {
      const results = store.search('buy', true)

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Buy milk')
    })

    it('should trim keyword whitespace', () => {
      const results = store.search('  milk  ')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Buy milk')
    })
  })

  // ─── filters ───────────────────────────────────────

  describe('getCompleted / getPending', () => {
    beforeEach(() => {
      store.add({ title: 'Task A' })
      store.add({ title: 'Task B' })
      store.add({ title: 'Task C' })
      store.update(2, { completed: true })
    })

    it('should return only completed todos', () => {
      const completed = store.getCompleted()

      expect(completed).toHaveLength(1)
      expect(completed[0].title).toBe('Task B')
    })

    it('should return only pending todos', () => {
      const pending = store.getPending()

      expect(pending).toHaveLength(2)
      expect(pending.map((t) => t.title)).toEqual(['Task A', 'Task C'])
    })
  })

  // ─── clear & count ─────────────────────────────────

  describe('clear / count', () => {
    it('should return correct count', () => {
      expect(store.count).toBe(0)

      store.add({ title: 'A' })
      store.add({ title: 'B' })

      expect(store.count).toBe(2)
    })

    it('should clear all todos and reset id counter', () => {
      store.add({ title: 'A' })
      store.add({ title: 'B' })
      store.clear()

      expect(store.count).toBe(0)
      expect(store.getAll()).toEqual([])

      const newTodo = store.add({ title: 'After clear' })
      expect(newTodo.id).toBe(1)
    })
  })
})
