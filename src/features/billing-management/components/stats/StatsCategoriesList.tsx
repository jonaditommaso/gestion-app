import { Badge } from "@/components/ui/badge";

interface StatsCategoriesListProps {
    categoriesData: {
      category: string,
      import: number,
      fill: string
    }[]
  }

const StatsCategoriesList = ({ categoriesData }: StatsCategoriesListProps) => {

    const totalCount = categoriesData.reduce((sum, element) => sum + element.import, 0);

    return (
        <div className="space-y-2">
            {categoriesData.map((element, index) => {
                const percentage = ((element.import / totalCount) * 100).toFixed(1);

                return (
                    <div className="flex items-center justify-between rounded-xl border border-muted/60 bg-muted/20 px-3 py-2" key={index}>
                        <div className="flex items-center gap-2">
                            <Badge style={{ backgroundColor: element.fill, width: '58px' }} className="justify-center text-white">
                                {percentage}%
                            </Badge>
                            <span className="text-sm">{element.category}</span>
                        </div>
                        <div className="text-sm font-medium">
                            € {element.import.toFixed(2)}
                        </div>
                    </div>
                )})
            }
        </div>
    );
}

export default StatsCategoriesList;