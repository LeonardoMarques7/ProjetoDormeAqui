import { Link } from "react-router-dom"

const Login = () => {
  return (
    <section className="flex items-center">
        <div className="max-w-96 mx-auto gap-4 flex flex-col items-center w-full">
            <h1 className="text-3xl font-bold">Faça seu login</h1>
            <form className="flex flex-col gap-2 w-full">
                <input type="email" className=" border border-gray-200 px-6 py-4 rounded-md w-full outline-primary-400" placeholder="Digite seu Email (teste@test.com)" />
                <input type="password" className=" border border-gray-200 px-6 py-4 rounded-md w-full outline-primary-400" placeholder="Digite sua senha"  />
                <button className="font-bold rounded-full text-2xl cursor-pointer w-full mx-4 py-5 bg-primary-700 text-white" >Entrar</button>
            </form>

            <p>Ainda não tem uma conta? <Link to="/register" className="underline font-semibold">Registre-se Aqui!</Link> </p>
        </div>
    </section>
  )
}

export default Login
