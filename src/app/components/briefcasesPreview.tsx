import BriefcaseCard from "./briefcaseCard";

// TODO: Replace with actual data
const briefcases = [
    {
        title: "Explore Engineering",
        description: "Elevating Bridge",
        image: "https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg",
        projectId: "1"
    },
    {
        title: "Explore Software",
        description: "Medical Online Evaluations",
        image: "https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg",
        projectId: "2"
    },
    {
        title: "Explore Security",
        description: "Advanced Key Cryptography",
        image: "https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg",
        projectId: "3"
    },
    {
        title: "Explore Robotics",
        description: "Advanced Bi-Pedal Drone",
        image: "https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg",
        projectId: "1"
    },
    {
        title: "Explore AI",
        description: "New Self Learning System",
        image: "https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg",
        projectId: "4"
    },
    {
        title: "Explore Signal",
        description: "Global Space Satellite",
        image: "https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg",
        projectId: "5"
    }
];

export default function BriefcasesPreview() {
    return (
        <div className="flex flex-col items-left justify-center py-16 px-16">
            <h1 className="text-4xl font-bold mb-2">Briefcases Preview</h1>
            <h2 className="text-2xl text-gray-500 mb-8">Explore Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {briefcases.map((briefcase, index) => (
                    <BriefcaseCard 
                        key={index}
                        title={briefcase.title} 
                        description={briefcase.description} 
                        image={briefcase.image}
                        projectId={briefcase.projectId}
                    />
                ))}
            </div>
        </div>
    )
}