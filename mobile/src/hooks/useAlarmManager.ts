import { useContext } from "react";
import { AlarmContext } from "../context/AlarmContext";


const useAlarmManager = () => useContext(AlarmContext);
export default useAlarmManager;