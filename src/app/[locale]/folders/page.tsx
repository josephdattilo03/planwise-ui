import FilterSidebar from "../../components/filters/FilterSidebar";
import FolderTreeDisplay from "../../components/folderTree/FolderTreeDisplay";

export default function FoldersPage() {
  return <div>
    <FilterSidebar showSmartRecommendations={false} showClearAll={false}>
      <FolderTreeDisplay></FolderTreeDisplay>
    </FilterSidebar>
  </div>
}
