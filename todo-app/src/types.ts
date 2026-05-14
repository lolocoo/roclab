export interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: Date
}

export type CreateTodoInput = Pick<Todo, 'title'>

export type UpdateTodoInput = Partial<Pick<Todo, 'title' | 'completed'>>
