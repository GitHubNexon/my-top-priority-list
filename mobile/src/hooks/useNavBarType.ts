import { useContext } from 'react';
import { NavBarTypeContext } from '../context/NavBarTypeContext';

const useNavBarType = () => useContext(NavBarTypeContext);
export default useNavBarType;
