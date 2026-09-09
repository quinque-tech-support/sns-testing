import { notFound } from 'next/navigation'
import TemplatesPrototype from '../TemplatesPrototype'
export default async function TemplatePage({params}: {params: Promise<{id: string}>}) {
    const {id} = await params
    if (id !== 'interview') notFound()
    return <TemplatesPrototype startInEditor />
}
