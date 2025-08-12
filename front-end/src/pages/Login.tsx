import { Lock, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import logo__secondary from "../assets/plano__fundo.png";

const Login = () => {
  return (
    <section className="flex items-center">
        <div className="w-1/2 h-full flex items-center relative justify-center"> 
        <img src={logo__secondary} className="h-[90svh] object-cover" alt="" /></div>
        <div className="max-w-96 mx-auto gap-4 flex flex-col items-start w-full">
            <h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
            <h3>Entre na sua conta para continuar</h3>
            <form className="flex flex-col gap-2 w-full">
              <div className="group__input relative flex justify-center items-center">
                <Mail className="absolute left-4 text-gray-400 size-6" />
                <input type="email" className="border border-gray-200 px-14 py-4 rounded-full w-full outline-primary-400" placeholder="Digite seu Email" />
              </div>
              <div className="group__input relative flex justify-center items-center">
                <Lock className="absolute left-4 text-gray-400 size-6" />
                <input type="password" className="border border-gray-200 px-14 py-4 rounded-full w-full outline-primary-400" placeholder="Digite sua senha" />
              </div>
              <button className="font-bold rounded-full text-2xl cursor-pointer w-full py-2 bg-primary-600 text-white mt-4" >Entrar</button>
            </form>

            <p>Ainda não tem uma conta? <Link to="/register" className="underline font-semibold">Registre-se Aqui!</Link> </p>
        </div>
    </section>
  )
}

export default Login
