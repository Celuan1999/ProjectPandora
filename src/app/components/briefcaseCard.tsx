import Link from 'next/link';

export default function BriefcaseCard({ title, description, image, projectId }: { 
    title: string, 
    description: string, 
    image: string,
    projectId?: string 
}) {
    return (
        <Link href={projectId ? `/project/${projectId}` : '#'} className="block">
            <div className="flex flex-col items-start justify-start bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <h2 className="text-2xl font-bold pb-4">{title}</h2>
                <div className="flex flex-row items-start justify-start gap-4">
                    <div className="flex flex-col items-center justify-center">
                        <img width={40} height={40} src={image} alt={title} />
                    </div>
                    <div className="flex flex-col items-start justify-start">
                        <p className="text-gray-700">{description}</p>
                        <p className="text-gray-400 text-sm cursor-pointer">Request Access</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}