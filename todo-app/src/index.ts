import { TodoStore } from './store'

const store = new TodoStore()

function printHelp(): void {
  console.log(`
📝 Todo App - Commands:
  add <title>     Add a new todo
  list            List all todos
  done <id>       Mark todo as completed
  remove <id>     Remove a todo
  pending         Show pending todos
  completed       Show completed todos
  help            Show this help
  exit            Exit the app
`)
}

function formatTodo(todo: { id: number; title: string; completed: boolean }): string {
  const status = todo.completed ? '✅' : '⬜'
  return `  ${status} [${todo.id}] ${todo.title}`
}

function handleCommand(input: string): boolean {
  const parts = input.trim().split(/\s+/)
  const cmd = parts[0]?.toLowerCase()
  const args = parts.slice(1).join(' ')

  switch (cmd) {
    case 'add': {
      if (!args) {
        console.log('❌ Please provide a title: add <title>')
        break
      }
      const todo = store.add({ title: args })
      console.log(`✅ Added: ${formatTodo(todo)}`)
      break
    }

    case 'list': {
      const todos = store.getAll()
      if (todos.length === 0) {
        console.log('📭 No todos yet. Use \"add <title>\" to create one.')
      } else {
        console.log(`📋 All Todos (${todos.length}):`)
        todos.forEach((t) => console.log(formatTodo(t)))
      }
      break
    }

    case 'done': {
      const id = parseInt(args)
      if (isNaN(id)) {
        console.log('❌ Please provide a valid id: done <id>')
        break
      }
      try {
        store.update(id, { completed: true })
        console.log(`✅ Marked #${id} as done`)
      } catch (e) {
        console.log(`❌ ${(e as Error).message}`)
      }
      break
    }

    case 'remove': {
      const removeId = parseInt(args)
      if (isNaN(removeId)) {
        console.log('❌ Please provide a valid id: remove <id>')
        break
      }
      if (store.remove(removeId)) {
        console.log(`🗑️ Removed #${removeId}`)
      } else {
        console.log(`❌ Todo #${removeId} not found`)
      }
      break
    }

    case 'pending': {
      const pending = store.getPending()
      console.log(`⬜ Pending (${pending.length}):`)
      pending.forEach((t) => console.log(formatTodo(t)))
      break
    }

    case 'completed': {
      const completed = store.getCompleted()
      console.log(`✅ Completed (${completed.length}):`)
      completed.forEach((t) => console.log(formatTodo(t)))
      break
    }

    case 'help':
      printHelp()
      break

    case 'exit':
    case 'quit':
      console.log('👋 Bye!')
      return false

    default:
      console.log('❓ Unknown command. Type \"help\" for available commands.')
  }

  return true
}

// Main
console.log('📝 Welcome to Todo App!')
printHelp()

// Add some demo todos
store.add({ title: 'Learn TypeScript' })
store.add({ title: 'Build a Todo App' })
store.add({ title: 'Test with Vitest' })

console.log('📋 Demo todos added:\n')
store.getAll().forEach((t) => console.log(formatTodo(t)))

export { TodoStore }
export type { Todo, CreateTodoInput, UpdateTodoInput } from './types'
