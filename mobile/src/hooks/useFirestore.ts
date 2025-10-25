import { useContext } from "react";
import { FirestoreContext } from "../context/FirestoreContext";

const useFirestore = () => useContext(FirestoreContext);
export default useFirestore;