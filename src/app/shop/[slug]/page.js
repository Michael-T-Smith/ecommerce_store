export default async function Page({ params }) {
  const { slug } = await params
 
  return (
    <div>
      <h1>{slug}</h1>
    </div>
  )
}