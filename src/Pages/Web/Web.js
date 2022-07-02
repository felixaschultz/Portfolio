import { useTitle } from "../../TitleContext";
export default function Home() {
    const { setTitle } = useTitle();

    React.useEffect(() => {
        setTitle('This is human readable title for Home Component')
    }, [])
    return (
        <>
            <main className="content">
                <h1>Web</h1>
            </main>
        </>
    )
}