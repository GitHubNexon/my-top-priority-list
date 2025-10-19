import { useContext } from "react";
import { AlarmConfigContext } from "../context/AlarmConfigContext";

const useAlarmSettings = () => useContext(AlarmConfigContext);
export default useAlarmSettings;