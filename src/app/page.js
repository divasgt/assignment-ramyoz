"use client"
import { useEffect, useState } from "react"
import { MdEdit, MdDelete } from "react-icons/md"

export default function Home() {
  const [notes, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [addTaskLoading, setAddTaskLoading] = useState(false)
  const [newTaskFormShown, setNewTaskFormShown] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")

  const [deletingId, setDeletingId] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [saveEditLoading, setSaveEditLoading] = useState(false)
  
  async function fetchTasks() {
    try {
      setLoading(true)

      const res = await fetch("/api/notes")
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to select notes")
      setTasks(data)
    } catch(err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchTasks()
  }, [])

  console.log(notes)

  async function addTask(e) {
    e.preventDefault()
    if (!newTitle) {
      alert("Please add a title.")
      return
    }
    
    try {
      setAddTaskLoading(true)

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title: newTitle, content: newContent})
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to add note")
      setTasks([data, ...notes])
      setNewTitle("")
      setNewContent("")
      setNewTaskFormShown(false)
    } catch(err) {
      alert(err.message)
    } finally {
      setAddTaskLoading(false)
    }
  }
  
  async function deleteTask(id) {
    if (!id) return

    try {
      setDeletingId(id)
      
      const res = await fetch(`/api/notes?id=${id}`, {method: "DELETE"})
      const result = await res.json()
  
      if (!res.ok) throw new Error(result.error || "Failed to delete note")
      setTasks(notes.filter(note => note._id !== id))
    } catch(err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  async function saveEdit(id) {
    try {
      setSaveEditLoading(true)
      
      const res = await fetch(`/api/notes?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editDesc }),
      })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Failed to save edit.")
        
      setTasks(notes.map((t) => (t.id === id ? result : t)))
      setEditingId(null)
      setEditTitle("")
      setEditDesc("")
    } catch (err) {
      alert(err.message)
    } finally {
      setSaveEditLoading(false)
    }
  }

  const tasksElements = notes.map(note => (
    <div
      className={`group flex items-start gap-4 px-4 py-3 rounded-lg border border-neutral-200/10 bg-neutral-800`}
      key={note._id}
    >
      <div className={`flex-1 flex-col gap-1`}>
        {note._id === editingId
          ? (
          // Editing UI
          <>
            <input
              className="block w-full mb-2 border border-neutral-200/20 rounded-lg px-3 py-1"
              type="text"
              placeholder="Edit title:"
              value={editTitle}
              onChange={(e) => setEditTitle(e.currentTarget.value)}
              />

            <input
              className="block w-full border border-neutral-200/20 rounded-lg px-3 py-1"
              type="text"
              placeholder="Edit content:"
              value={editDesc}
              onChange={(e) => setEditDesc(e.currentTarget.value)}
            />
          </>
          ) : (
          // Display UI
          <>
            <h2>{note.title}</h2>
            <p className="text-neutral-400 text-sm">{note.content || "a"}</p>
          </>
          )
        }
      </div>

      {/* Edit and Delete buttons */}
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 duration-100 flex flex-col items-start text-xs gap-2">
        {/* Show edit button, if editing show save and cancel buttons */}
        {note._id !== editingId
          ? <button
            className="flex gap-2 rounded-lg border border-neutral-200/10 bg-neutral-600 px-2 py-1 hover:opacity-80 duration-200 cursor-pointer"
            onClick={() => {
              setEditingId(note._id)
              setEditTitle(note.title)
              setEditDesc(note.content)
            }}
          >
            <MdEdit className=" mt-0.5"/>Edit
          </button>
          : (
            <>
              <button
                className={`flex gap-2 rounded-lg border border-neutral-200/10 bg-neutral-600 px-2 py-1 hover:opacity-80 duration-200 cursor-pointer ${saveEditLoading && "animate-pulse"}`}
                onClick={() => saveEdit(note._id)}
                disabled={saveEditLoading}
              >
                {saveEditLoading ? "Saving" : "Save"}
              </button>
              <button
                className="flex gap-2 rounded-lg border border-neutral-200/10 bg-neutral-600 px-2 py-1 hover:opacity-80 duration-200 cursor-pointer"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </>
          )
        }

        <button
          className={`flex gap-2 items-center rounded-lg border border-neutral-200/10 bg-neutral-600 hover:bg-red-800 duration-200 px-2 py-1 hover:opacity-80 cursor-pointer ${deletingId===note._id && "animate-pulse"}`}
          onClick={() => deleteTask(note._id)}
          disabled={deletingId === note._id}
        >
          <MdDelete />{deletingId===note._id ? "Deleting" : "Delete"}
        </button>
      </div>
    </div>
  ))
  
  if (loading) return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Notes App</h1>
      <div className="text-center mt-52 text-lg animate-pulse">Loading...</div>
    </main>
  )
  if (error) return <div className="grid place-items-center p-8">Error: {error}</div>

  return (
  <main className="min-h-screen p-8">
    <h1 className="text-2xl font-bold mb-6 text-center">Notes App</h1>

    {/* Add new note form */}
    <div className="flex items-start gap-4 mb-4">
      <button
        className="rounded-lg border border-neutral-200/10 bg-green-800 px-3 py-1 hover:opacity-90 cursor-pointer"
        onClick={() => setNewTaskFormShown(!newTaskFormShown)}
      >+ New note</button>
      
      {newTaskFormShown &&
        <form onSubmit={addTask} className="flex items-baseline gap-3">
          <div className="flex flex-col gap-1">
            <input
              className="border border-neutral-200/10 bg-neutral-800 rounded-lg px-3 py-1"
              type="text"
              placeholder="Title*"
              value={newTitle}
              onChange={(e) => setNewTitle(e.currentTarget.value)}
            />
            <input
              className="border border-neutral-200/10 bg-neutral-800 rounded-lg px-3 py-1"
              type="text"
              placeholder="Content"
              value={newContent}
              onChange={(e) => setNewContent(e.currentTarget.value)}
            />
          </div>

          <button
            type="submit"
            className={`rounded-lg border border-neutral-200/10 bg-green-800 px-3 py-1 hover:opacity-90 cursor-pointer`}
            disabled={addTaskLoading}
          >
            <span className={addTaskLoading && "animate-pulse"}>
              {addTaskLoading ? "Adding..." : "Add"}
            </span>
          </button>
        </form>
      }

    </div>

    <div className="grid gap-y-3">
      {notes.length === 0 
        ? <p className="text-center mt-20">No notes. Try adding a new note.</p>
        : tasksElements
      }
    </div>
  </main> 
  )
}
