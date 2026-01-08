import dbConnect from "@/lib/dbConnect"; // Use the utility from previous response
import Note from "@/models/Note";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  try {
    const notes = await Note.find({}).sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const { title, content } = await request.json();
    const newNote = await Note.create({ title, content });
    return NextResponse.json(newNote);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  await dbConnect();
  const id = new URL(request.url).searchParams.get('id');
  try {
    await Note.findByIdAndDelete(id);
    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  await dbConnect();
  const id = new URL(request.url).searchParams.get("id");
  const updateData = await request.json();
  try {
    const updatedNote = await Note.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(updatedNote);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}