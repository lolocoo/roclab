import { Todo, CreateTodoInput, UpdateTodoInput } from './types'

export class TodoStore {
  private todos: Todo[] = []
  private nextId = 1

  add(input: CreateTodoInput): Todo {
    const trimmed = input.title.trim()

    if (!trimmed) {
      throw new Error('Todo title cannot be empty')
    }

    const todo: Todo = {
      id: this.nextId++,
      title: trimmed,
      completed: false,
      createdAt: new Date(),
    }

    this.todos.push(todo)
    return todo
  }

  getAll(): Todo[] {
    return [...this.todos]
  }

  getById(id: number): Todo | undefined {
    return this.todos.find((t) => t.id === id)
  }

  update(id: number, input: UpdateTodoInput): Todo {
    const todo = this.todos.find((t) => t.id === id)

    if (!todo) {
      throw new Error(`Todo with id ${id} not found`)
    }

    if (input.title !== undefined) {
      const trimmed = input.title.trim()
      if (!trimmed) {
        throw new Error('Todo title cannot be empty')
      }
      todo.title = trimmed
    }

    if (input.completed !== undefined) {
      todo.completed = input.completed
    }

    return { ...todo }
  }

  remove(id: number): boolean {
    const index = this.todos.findIndex((t) => t.id === id)
    if (index === -1) return false
    this.todos.splice(index, 1)
    return true
  }

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

  get count(): number {
    return this.todos.length
  }
}
