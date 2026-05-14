import type { Todo, CreateTodoInput, UpdateTodoInput } from './types'

export class TodoStore {
  private todos: Todo[] = []
  private nextId = 1

  add(input: CreateTodoInput): Todo {
    const todo: Todo = {
      id: this.nextId++,
      title: input.title,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.todos.push(todo)
    return todo
  }

  getById(id: number): Todo | undefined {
    return this.todos.find((t) => t.id === id)
  }

  getAll(): Todo[] {
    return [...this.todos]
  }

  update(id: number, input: UpdateTodoInput): Todo {
    const todo = this.todos.find((t) => t.id === id)
    if (!todo) {
      throw new Error(`Todo #${id} not found`)
    }

    if (input.title !== undefined) {
      todo.title = input.title
    }
    if (input.completed !== undefined) {
      todo.completed = input.completed
    }
    todo.updatedAt = new Date()

    return todo
  }

  remove(id: number): boolean {
    const index = this.todos.findIndex((t) => t.id === id)
    if (index === -1) return false

    this.todos.splice(index, 1)
    return true
  }

  /**
   * Search todos by title keyword with optional status filter.
   * Only searches the `title` field (case-insensitive).
   *
   * @param keyword - Text to match against todo titles (trimmed, case-insensitive)
   * @param completed - Optional filter: `true` = done only, `false` = pending only
   */
  search(keyword: string, completed?: boolean): Todo[] {
    const lowerKeyword = keyword.toLowerCase().trim()

    return this.todos.filter((todo) => {
      const matchesKeyword = !lowerKeyword || todo.title.toLowerCase().includes(lowerKeyword)
      const matchesStatus = completed === undefined || todo.completed === completed
      return matchesKeyword && matchesStatus
    })
  }

  getCompleted(): Todo[] {
    return this.todos.filter((t) => t.completed)
  }

  getPending(): Todo[] {
    return this.todos.filter((t) => !t.completed)
  }

  clear(): void {
    this.todos = []
    this.nextId = 1
  }
}
