export default function BriefcaseCard({ title, description, image }: { title: string, description: string, image: string }  ) {
    return (
        <div className="flex flex-col items-start justify-start bg-white p-4 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold pb-4">{title}</h2>
            <div className="flex flex-row items-start justify-start gap-4">
                <div className="flex flex-col items-center justify-center">
                    <img width={40} height={40} src={image} alt={title} />
                </div>
                <div className="flex flex-col items-start justify-start">
                    <p className="text-gray-700">{description}</p>
                    <a className="text-gray-400 text-sm cursor-pointer">Request Access</a>
                </div>
            </div>
        </div>
    )
}