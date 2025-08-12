import Item from "../components/Item"

const Home = () => {
  return (
    <section>
        <div className="p-8 max-w-7xl mx-auto grid grid-cols-[repeat(auto-fit,_minmax(225px,_1fr))] gap-8">
            <Item />
            <Item />
            <Item />
            <Item />
            <Item />
            <Item />
            <Item />
            <Item />
            <Item />
        </div>
    </section>
  )
}

export default Home
