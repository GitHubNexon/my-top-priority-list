import { useContext } from "react";
import { NotesContext } from "../context/NotesContext";

const useNotes = () => useContext(NotesContext);
export default useNotes;