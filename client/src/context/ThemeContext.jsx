import { createContext , useContext , useState } from "react";



const themeContext = createContext();


export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState('light')
    
    return (
        <themeContext.Provider value={{theme , setTheme}}>
            {children}
        </themeContext.Provider>
    )
}


export const useTheme = () => useContext(themeContext)