import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
        <div className="min-w-[300px] w-[450px] md:pl-[45px] md:m-auto">
            {categoriesData.map((element, index) => {
                const percentage = ((element.import / totalCount) * 100).toFixed(1);

                return (
                    <div className="flex justify-between mx-2 items-center border-[1px] p-2 w-[400px]" key={index}>
                        <div className="flex items-center gap-2">
                            <Badge style={{ backgroundColor: element.fill, width: '55px' }}>{percentage}%</Badge>
                            <span>{element.category}</span>
                        </div>
                        <div>
                            $ {element.import}
                        </div>
                    </div>
                )})
            }
        </div>
    );
}

export default StatsCategoriesList;