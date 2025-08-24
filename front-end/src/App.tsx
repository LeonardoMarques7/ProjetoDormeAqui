import Header from "./components/Header"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Teste from "./components/Teste"
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/teste" element={<Teste /> } />
                
                
            </Routes>
        </BrowserRouter>
    )
}

export default App
